import { Upload } from '@aws-sdk/lib-storage'
import * as pb from '@ipld/dag-pb'
import AWS from 'aws-sdk'
import debug from 'debug'
import formatNumber from 'format-number'
import batch from 'it-batch'
import { pipe } from 'it-pipe'
import { CID } from 'multiformats'
import * as raw from 'multiformats/codecs/raw'
import { Readable } from 'stream'

export default class Backup {
  constructor (env) {
    this.UPDATE_BACKUP_URL = 'UPDATE psa_pin_request SET backup_urls = $1 WHERE id = $2 AND content_cid = $3 RETURNING *'
    this.fmt = formatNumber()
    this.SIZE_TIMEOUT = 1000 * 10 // timeout if we can't figure out the size in 10s
    this.BLOCK_TIMEOUT = 1000 * 30 // timeout if we don't receive a block after 30s
    this.REPORT_INTERVAL = 1000 * 60 // log download progress every minute
    this.MAX_DAG_SIZE = 1024 * 1024 * 1024 * 32 // don't try to transfer a DAG that's bigger than 32GB
    this.log = debug('backup:pins')
    this.env = env
    this.LIMIT = env.QUERY_LIMIT !== undefined ? env.QUERY_LIMIT : 10000
    this.GET_PINNED_PINS_QUERY = `
      SELECT psa.id, psa.backup_urls, psa.source_cid, psa.content_cid, psa.name, psa.auth_key_id
      FROM psa_pin_request psa
        JOIN pin p ON p.content_cid = psa.content_cid
      WHERE p.status = 'Pinned'
        AND psa.backup_urls IS NULL
      LIMIT $1
    `
    this.s3 = new AWS.S3({})
    this.CONCURRENCY = env.CONCURRENCY !== undefined ? env.CONCURRENCY : 10
  }

  /**
   * @param {import('pg').Client} db
   */
  registerBackup (db, contentCid, pinRequestId) {
    /**
     * @param {AsyncIterable<import('./bindings').RemoteBackup} source
     */
    return async (source) => {
      for await (const bak of source) {
        this.log(`backing up ${JSON.stringify(bak)}`)
        const res = await db.query(this.UPDATE_BACKUP_URL, [[bak.backupUrl.toString()], pinRequestId, contentCid])
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
    /**
     * @param {AsyncIterable<import('./bindings').BackupContent} source
     */
    return async function * (source) {
      for await (const bak of source) {
        const backupUrl = await this.s3Upload(s3, bucketName, bak)
        /** @type {import('./bindings').RemoteBackup} */
        const backup = { ...bak, backupUrl }
        yield backup
      }
    }
  }

  /**
   * @param {import('@aws-sdk/client-s3').S3Client} s3
   * @param {string} bucketName
   * @param {import('./bindings').BackupContent} bak
   */
  async s3Upload (s3, bucketName, bak) {
    const key = `complete/${bak.contentCid}.car`
    const region = await s3.config.region()
    const url = new URL(`https://${bucketName}.s3.${region}.amazonaws.com/${key}`)
    this.log(`uploading to ${url}`)
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
    this.log('done')
    return url
  }

  /**
   * @param {() => Promise<import('ipfs-core').IPFS>} getIpfs
   * @param {Object} [options]
   * @param {number} [options.maxDagSize] Skip DAGs that are bigger than this.
   */
  exportCar (ipfs, options = {}) {
    /**
     * @param {AsyncIterable<import('./bindings').BackupCandidate>} source
     * @returns {AsyncIterableIterator<import('./bindings').BackupContent>}
     */
    return async function * (source) {
      for await (const candidate of source) {
        yield { ...candidate, content: this.ipfsDagExport(ipfs, candidate.sourceCid, options) }
      }
    }
  }

  /**
   * Export a CAR for the passed CID.
   *
   * @param {import('./ipfs-client').IpfsClient} ipfs
   * @param {import('multiformats').CID} cid
   * @param {Object} [options]
   * @param {number} [options.maxDagSize]
   */
  async * ipfsDagExport (ipfs, cid, options) {
    const maxDagSize = options.maxDagSize || this.MAX_DAG_SIZE

    let reportInterval
    try {
      this.log('determining size...')
      let bytesReceived = 0
      const bytesTotal = await this.getSize(ipfs, cid)
      this.log(bytesTotal == null ? 'unknown size' : `size: ${this.fmt(bytesTotal)} bytes`)

      if (bytesTotal != null && bytesTotal > maxDagSize) {
        throw Object.assign(
          new Error(`DAG too big: ${this.fmt(bytesTotal)} > ${this.fmt(maxDagSize)}`),
          { code: 'ERR_TOO_BIG' }
        )
      }

      reportInterval = setInterval(() => {
        const formattedTotal = bytesTotal ? this.fmt(bytesTotal) : 'unknown'
        this.log(`received ${this.fmt(bytesReceived)} of ${formattedTotal} bytes`)
      }, this.REPORT_INTERVAL)

      for await (const chunk of ipfs.dagExport(cid, { timeout: this.BLOCK_TIMEOUT })) {
        bytesReceived += chunk.byteLength
        yield chunk
      }

      this.log('done')
    } finally {
      clearInterval(reportInterval)
    }
  }

  /**
   * @param {import('./ipfs-client').IpfsClient} ipfs
   * @param {import('multiformats').CID} cid
   * @returns {Promise<number | undefined>}
   */
  async getSize (ipfs, cid) {
    if (cid.code === raw.code) {
      const block = await ipfs.blockGet(cid, { timeout: this.SIZE_TIMEOUT })
      return block.byteLength
    } else if (cid.code === pb.code) {
      const stat = await ipfs.objectStat(cid, { timeout: this.SIZE_TIMEOUT })
      return stat.CumulativeSize
    }
  }

  /**
   * Fetch a list of CIDs that need to be backed up.
   *
   * @param {import('pg').DbClient} db Postgres client.
   * @param {Object} [options]
   * @param {Date} [options.startDate]
   * @param {(cid: CID) => Promise<boolean>} [options.filter]
   */
  async * getPinsNotBackedUp (db, options = {}) {
    const { rows } = await db.query(this.GET_PINNED_PINS_QUERY, [
      this.LIMIT
    ])
    if (!rows.length) return
    const uploads = rows.filter(r => !r.url)

    for (const [, upload] of uploads.entries()) {
      const sourceCid = CID.parse(upload.source_cid)
      const pin = {
        sourceCid,
        contentCid: CID.parse(upload.content_cid),
        authKeyId: String(upload.auth_key_id),
        pinRequestId: String(upload.id)
      }
      yield pin
    }
  }

  /**
   * This job grabs 10,000 pins which do not have a backup URL and sends them to S3 and updates the record with the S3 URL
   * @param {{ env: NodeJS.ProcessEnv, rwPg: Client, roPg: Client, cluster: import('@nftstorage/ipfs-cluster').Cluster }} config
   */
  async backupPins ({ roPg, rwPg, cluster, concurrency = this.CONCURRENCY }) {
    if (!this.log.enabled) {
      console.log('ℹ️ Enable logging by setting DEBUG=backup:pins')
    }

    let totalProcessed = 0
    let totalSuccessful = 0

    await pipe(this.getPinsNotBackedUp(roPg), async (source) => {
      for await (const pins of batch(source, concurrency)) {
        this.log(`Got pins: ${JSON.stringify(pins)}`)
        await Promise.all(pins.map(async pin => {
          this.log(`processing pin ${JSON.stringify(pin)}`)
          try {
            await pipe(
              [pin],
              this.exportCar(cluster),
              this.uploadCar(this.s3, this.env.s3PickupBucketName),
              this.registerBackup(rwPg, pin.content_cid, pin.pinRequestId)
            )
            totalSuccessful++
          } catch (err) {
            this.log(`failed to backup ${pin.sourceCid}`, err)
          }
        }))
        totalProcessed++
      }
      this.log(`processed ${totalSuccessful} of ${totalProcessed} CIDs successfully`)
    })
    this.log('backup complete 🎉')
  }
}
