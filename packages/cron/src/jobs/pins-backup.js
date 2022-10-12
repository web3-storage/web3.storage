import { Upload } from '@aws-sdk/lib-storage'
import * as pb from '@ipld/dag-pb'
import { Dagula } from 'dagula'
import { getLibp2p } from 'dagula/p2p.js'
import debug from 'debug'
import formatNumber from 'format-number'
import batch from 'it-batch'
import { pipe } from 'it-pipe'
import { CID } from 'multiformats'
import * as raw from 'multiformats/codecs/raw'
import { Readable } from 'stream'
import { getS3Client } from '../lib/utils.js'
import { HeadObjectCommand } from '@aws-sdk/client-s3'

export default class Backup {
  constructor (env) {
    this.UPDATE_BACKUP_URL_QUERY = `
      UPDATE psa_pin_request
      SET backup_urls=$1
      WHERE id = $2 AND
      content_cid= $3
      RETURNING *
    `
    this.fmt = formatNumber()
    this.SIZE_TIMEOUT = 1000 * 10 // timeout if we can't figure out the size in 10s
    this.BLOCK_TIMEOUT = 1000 * 30 // timeout if we don't receive a block after 30s
    this.REPORT_INTERVAL = 1000 * 60 // log download progress every minute
    this.MAX_DAG_SIZE = 1024 * 1024 * 1024 * 32 // don't try to transfer a DAG that's bigger than 32GB
    this.log = debug('backup:pins')
    this.env = env
    this.LIMIT = env.QUERY_LIMIT !== undefined ? env.QUERY_LIMIT : 10000
    this.GET_PINNED_PINS_QUERY = `
      SELECT DISTINCT ON(psa.id)
        psa.id,
        psa.backup_urls,
        psa.source_cid,
        psa.content_cid,
        psa.name,
        psa.auth_key_id,
        pl.peer_id
      FROM psa_pin_request psa
        JOIN pin p ON p.content_cid = psa.content_cid
        JOIN pin_location pl ON pl.id = p.pin_location_id
      WHERE p.status = 'Pinned'
        AND psa.backup_urls = '{}'
      LIMIT $1
    `
    this.s3 = getS3Client(env)
    /**
     * @type { number }
     */
    this.CONCURRENCY = env.CONCURRENCY !== undefined ? env.CONCURRENCY : 10
  }

  /**
   * @param {import('pg').Pool} db
   */
  registerBackup (db, contentCid, pinRequestId) {
    /**
     * @param {AsyncIterable<import('../types/pins-backup').RemoteBackup>} source
     */
    return async (source) => {
      for await (const bak of source) {
        this.log(`backing up ${JSON.stringify(bak)}`)
        const res = await db.query(this.UPDATE_BACKUP_URL_QUERY, [
          [bak.backupUrl.toString()],
          pinRequestId,
          contentCid.toString()
        ])
        this.log(`Result from updating pin request ${JSON.stringify(res)}`)
        this.log(`saved backup record for upload ${bak.contentCid}: ${bak.backupUrl.toString()}, rowId: ${pinRequestId}`)
      }
    }
  }

  /**
   * @param {import('@aws-sdk/client-s3').S3Client} s3
   * @param {string} bucketName
   */
  uploadCar (s3, bucketName) {
    // rebind this for curried function
    const _this = this

    /**
     * @param {AsyncIterable<import('../types/pins-backup').BackupContent} source
     */
    return async function * (source) {
      for await (const bak of source) {
        const backupUrl = await _this.s3Upload(s3, bucketName, bak)
        /** @type {import('../types/pins-backup').RemoteBackup} */
        const backup = { ...bak, backupUrl }
        yield backup
      }
    }
  }

  /**
   * @param {import('@aws-sdk/client-s3').S3Client} s3
   * @param {string} bucketName
   * @param {import('../types/pins-backup').BackupContent} bak
   */
  async s3Upload (s3, bucketName, bak) {
    const key = `complete/${bak.sourceCid}.car`
    const region = this.env.S3_BUCKET_REGION
    const url = new URL(`https://${bucketName}.s3.${region}.amazonaws.com/${key}`)
    this.log(`uploading to ${url}`)
    this.log(`got bak ${JSON.stringify(bak)}`)
    try {
      // Request the head object of the file we are about to backup
      // If it throws a NotFound error then we know we need to upload it
      const command = new HeadObjectCommand({ Bucket: bucketName, Key: key })
      const res = await this.s3.send(command)
      this.log('It already exists', res)
    } catch (err) {
      if (err.name === 'NotFound') {
        const upload = new Upload({
          client: s3,
          params: {
            Bucket: bucketName,
            Key: key,
            Body: Readable.from(bak.content),
            Metadata: { structure: 'Complete' }
          }
        })
        await upload.done()
      }
    }
    this.log('done')
    return url
  }

  /**
   * @param {import('@nftstorage/ipfs-cluster').Cluster} ipfs
   * @param {Array<import('@nftstorage/ipfs-cluster/src/interface.js').PeerInfo>} peersList
   * @param {Object} [options]
   * @param {number} [options.maxDagSize] Skip DAGs that are bigger than this.
   */
  exportCar (ipfs, peersList, options = {}) {
    /**
     * @param {AsyncIterable<import('../types/pins-backup').BackupCandidate>} source
     * @returns {AsyncIterableIterator<import('../types/pins-backup').BackupContent>}
     */
    const _this = this
    return async function * (source) {
      for await (const pin of source) {
        const peer = peersList.find((peer) => peer.id === pin.peer)
        if (peer) {
          const content = _this.ipfsDagExport(ipfs, pin.sourceCid, peer?.addresses[0], options)
          _this.log(`Content: ${JSON.stringify(content)}`)
          yield { ...pin, content }
        } else {
          this.log(`Warning: ${JSON.stringify(pin)} has not been found on cluster`)
        }
      }
    }
  }

  /**
   * Export a CAR for the passed CID.
   *
   * @param {import('@nftstorage/ipfs-cluster').Cluster} ipfs
   * @param {import('multiformats').CID} cid
   * @param {string} peer The IPFS peer that the CID is available on
   * @param {Object} [options]
   * @param {number} [options.maxDagSize]
   */
  async * ipfsDagExport (ipfs, cid, peer, options) {
    const maxDagSize = options?.maxDagSize || this.MAX_DAG_SIZE

    let reportInterval
    try {
      const libp2p = await getLibp2p()
      const dagula = await Dagula.fromNetwork(libp2p, { peer })
      this.log('determining size...')
      let bytesReceived = 0
      let bytesTotal
      // Given for PIN requests we never limited by files size we should move all pins requests.

      // const bytesTotal = await this.getSize(ipfs, cid)
      // this.log(bytesTotal == null ? 'unknown size' : `size: ${this.fmt(bytesTotal)} bytes`)

      // if (bytesTotal != null && bytesTotal > maxDagSize) {
      //   throw Object.assign(
      //     new Error(`DAG too big: ${this.fmt(bytesTotal)} > ${this.fmt(maxDagSize)}`),
      //     { code: 'ERR_TOO_BIG' }
      //   )
      // }

      reportInterval = setInterval(() => {
        const formattedTotal = bytesTotal ? this.fmt(bytesTotal) : 'unknown'
        this.log(`received ${this.fmt(bytesReceived)} of ${formattedTotal} bytes`)
      }, this.REPORT_INTERVAL)

      for await (const chunk of dagula.get(cid)) {
        bytesReceived += chunk.bytes.length
        this.log(`chunk: ${JSON.stringify(chunk)}`)
        yield chunk
      }

      this.log('done')
    } catch (err) {
      this.log(`Error when fetching car file ${err.message}`)
      this.log(`Error: ${JSON.stringify(err)}`)
    } finally {
      clearInterval(reportInterval)
    }
  }

  /**
   * Get the size of an file on IPFS
   * This is so we can limit the size of files we backup
   *
   * @param {import('@nftstorage/ipfs-cluster').Cluster} ipfs
   * @param {import('multiformats').CID} cid
   * @returns {Promise<number | undefined>}
   */

  // Given for PIN requests we never limited files size we shouldn't check this. ie.
  // async getSize (ipfs, cid) {
  //   if (cid.code === raw.code) {
  //     const block = await ipfs.blockGet(cid, { timeout: this.SIZE_TIMEOUT })
  //     return block.byteLength
  //   } else if (cid.code === pb.code) {
  //     const stat = await ipfs.objectStat(cid, { timeout: this.SIZE_TIMEOUT })
  //     return stat.CumulativeSize
  //   }
  // }

  /**
   * Fetch a list of CIDs that need to be backed up.
   *
   * @param {import('pg').Pool} db Postgres client.
   */
  async * getPinsNotBackedUp (db) {
    const { rows } = await db.query(this.GET_PINNED_PINS_QUERY, [
      this.LIMIT
    ])
    if (!rows.length) return
    const pinnedPins = rows.filter(r => !r.url)

    for (const [, pinnedPin] of pinnedPins.entries()) {
      const sourceCid = CID.parse(pinnedPin.source_cid)
      const pin = {
        sourceCid,
        contentCid: CID.parse(pinnedPin.content_cid),
        authKeyId: String(pinnedPin.auth_key_id),
        pinRequestId: String(pinnedPin.id),
        peer: String(pinnedPin.peer_id)
      }
      yield pin
    }
  }

  /**
   * This job grabs 10,000 pins which do not have a backup URL and sends them to S3 and updates the record with the S3 URL
   * @param {{ env: NodeJS.ProcessEnv, rwPg: import('pg').Pool, roPg: import('pg').Pool, cluster: import('@nftstorage/ipfs-cluster').Cluster, concurrency: number }} config
   */
  async backupPins ({ roPg, rwPg, cluster, concurrency = this.CONCURRENCY }) {
    if (!this.log.enabled) {
      console.log('ℹ️ Enable logging by setting DEBUG=backup:pins')
    }

    const peersList = await cluster.peerList()

    let totalProcessed = 0
    let totalSuccessful = 0

    await pipe(this.getPinsNotBackedUp(roPg), async (source) => {
      for await (const pins of batch(source, concurrency)) {
        this.log(`Got ${pins.length} pins: ${JSON.stringify(pins)}`)
        await Promise.all(pins.map(async pin => {
          this.log(`processing pin ${JSON.stringify(pin)}`)
          try {
            await pipe(
              [pin],
              this.exportCar(cluster, peersList),
              this.uploadCar(this.s3, this.env.S3_BUCKET_NAME),
              this.registerBackup(rwPg, pin.contentCid, pin.pinRequestId)
            )
            totalSuccessful++
          } catch (err) {
            this.log(`failed to backup ${pin.sourceCid}`, err)
          }
          totalProcessed++
        }))
      }
      if (totalProcessed > 0) this.log(`processed ${totalSuccessful} of ${totalProcessed} CIDs successfully`)
    })
    this.log('backup complete 🎉')
  }
}
