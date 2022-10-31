import { Upload } from '@aws-sdk/lib-storage'
import { Dagula } from 'dagula'
import { getLibp2p } from 'dagula/p2p.js'
import debug from 'debug'
import formatNumber from 'format-number'
import batch from 'it-batch'
import { pipe } from 'it-pipe'
import { CID } from 'multiformats'
import { Readable } from 'stream'
import { getS3Client } from '../lib/utils.js'
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { CarWriter } from '@ipld/car'

import fetch from '@web-std/fetch'
import { FormData } from '@web-std/form-data'
import { File, Blob } from '@web-std/file'
import { TimeoutController } from 'timeout-abort-controller'

Object.assign(global, { fetch, File, Blob, FormData })

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
    this.MAX_UPLOAD_DAG_SIZE = 1024 * 1024 * 1024 * 32 // We don't limit in psa pin transfers in this case, but we still want to log if we have larger pin requests.
    this.log = debug('backupPins:log')
    this.debug = debug('backupPins:debug')
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
        pl.ipfs_peer_id
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

    /**
     * @type{Object.<string, Dagula>}
     */
    this.dagulaInstancesMap = {}
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
        this.debug(`⏳ Saving backup url to DB for ${contentCid}`)
        await db.query(this.UPDATE_BACKUP_URL_QUERY, [
          [bak.backupUrl.toString()],
          pinRequestId,
          contentCid.toString()
        ])
        this.debug(`✅ Saved backup record for upload ${bak.contentCid}: ${bak.backupUrl.toString()}, rowId: ${pinRequestId}`)
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

    try {
      // Request the head object of the file we are about to backup
      // If it throws a NotFound error then we know we need to upload it
      const command = new HeadObjectCommand({ Bucket: bucketName, Key: key })
      const res = await this.s3.send(command)
      this.debug('ℹ️ Car file already exists in S3. Skipping upload.', res)
    } catch (err) {
      if (err.name === 'NotFound') {
        this.debug(`⏳ Uploading to ${url}`)

        const upload = new Upload({
          client: s3,
          params: {
            Bucket: bucketName,
            Key: key,
            Body: bak.content,
            Metadata: { structure: 'Complete' }
          }
        })
        await upload.done()
      }
    }
    this.debug(`✅ Finished uploading ${bak.sourceCid}`)
    return url
  }

  /**
   * @param {import('@nftstorage/ipfs-cluster').Cluster} ipfs
   * @param {Array<import('@nftstorage/ipfs-cluster/src/interface.js').ClusterInfo>} peersList
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
        const peer = peersList.find((peer) => peer.ipfs.id === pin.peer)
        if (peer) {
          const content = await _this.ipfsDagExport(pin.sourceCid, peer.ipfs.addresses[0], options)
          yield { ...pin, content }
        } else {
          throw (new Error('Provided CID has not been found on cluster'))
        }
      }
    }
  }

  /**
   * Export a CAR for the passed CID.
   *
   * @param {import('multiformats').CID} cid
   * @param {string} peer The IPFS peer that the CID is available on
   * @param {Object} [options]
   */
  async ipfsDagExport (cid, peer, options) {
    const { writer, out } = await CarWriter.create([cid])
    const readableStream = Readable.from(out)

    // Do not need to await this.
    ;(async () => {
      const abortController = new TimeoutController(200_000)
      let bytesReceived = 0
      let error

      let reportInterval
      if (!this.libp2p) {
        this.libp2p = await getLibp2p()
      }

      if (!this.dagulaInstancesMap[peer]) {
        this.dagulaInstancesMap[peer] = await Dagula.fromNetwork(this.libp2p, { peer })
        this.debug('ℹ️ Reusing existing instance of Dagula')
      }

      try {
        const dagula = this.dagulaInstancesMap[peer]
        let bytesTotal

        reportInterval = setInterval(() => {
          const formattedTotal = bytesTotal ? this.fmt(bytesTotal) : 'unknown'
          this.debug(`ℹ️ CID: ${cid}. Received ${this.fmt(bytesReceived)} of ${formattedTotal} bytes`)
        }, this.REPORT_INTERVAL)

        this.debug(`⏳ Started reading dag ${cid}`)

        for await (const chunk of dagula.get(cid, {
          signal: abortController.signal
        })) {
          abortController.reset()
          bytesReceived += chunk.bytes.length
          await writer.put(chunk)
        }

        this.debug(`✅ Finished reading dag ${cid}. In total ${this.fmt(bytesReceived)}`)
      } catch (err) {
        // @ts-ignore
        error = new Error(`An error occured while reading dag from cluster. Size of the dag is greater than ${this.fmt(bytesReceived)} bytes`, {
          cause: err
        })
        readableStream.destroy(error)
        throw (err)
      } finally {
        if (bytesReceived > this.MAX_UPLOAD_DAG_SIZE && !error) {
          this.log(`⚠️ CID: ${cid} dag is greater 32Gib. Dag is ${this.fmt(bytesReceived)} bytes`)
        }
        writer.close()
        clearInterval(reportInterval)
        abortController.clear()
      }
    })()
    return readableStream
  }

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
        peer: String(pinnedPin.ipfs_peer_id)
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
      console.log('ℹ️ Enable logging by setting DEBUG=backupPins:log. Enable debugging by setting DEBUG=backupPins:debug')
    }

    const peersList = await cluster.peerList()

    let totalProcessed = 0
    let totalSuccessful = 0

    await pipe(this.getPinsNotBackedUp(roPg), async (source) => {
      for await (const pins of batch(source, concurrency)) {
        this.log(`ℹ️ Got ${pins.length} pins.`)
        await Promise.all(pins.map(async pin => {
          this.debug(`ℹ️ Processing pin id ${pin.pinRequestId} for cid ${pin.sourceCid}`)
          try {
            await pipe(
              [pin],
              this.exportCar(cluster, peersList),
              this.uploadCar(this.s3, this.env.S3_BUCKET_NAME),
              this.registerBackup(rwPg, pin.contentCid, pin.pinRequestId)
            )
            totalSuccessful++
          } catch (err) {
            this.log(`🚨 Failed to backup ${pin.sourceCid}. Details: ${err.message}`)
            this.debug(err, err.cause)
          }
          totalProcessed++
        }))
      }
      if (totalProcessed > 0) this.log(`ℹ️ Processed ${totalSuccessful} of ${totalProcessed} CIDs successfully`)
    })
    this.log('backup complete 🎉')
    this.libp2p?.stop()
  }
}
