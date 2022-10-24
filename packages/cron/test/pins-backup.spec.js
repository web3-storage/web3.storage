/* eslint-env mocha */
import { createPsaPinRequest, createUser, createUserAuthKey } from '@web3-storage/db/test-utils'
import Backup from '../src/jobs/pins-backup.js'
import assert from 'assert'
import { getCluster, getDBClient, getPg, getS3Client } from '../src/lib/utils.js'
import { GetObjectCommand } from '@aws-sdk/client-s3'

import { packToBlob } from 'ipfs-car/pack/blob'
import { unpackStream } from 'ipfs-car/unpack'
import { getPins, waitOkPins } from './pins-utils.js'

const env = {
  ...process.env,
  DEBUG: 'backup:pins',
  ENV: 'dev',
  CLUSTER_API_URL: 'http://localhost:9094',
  CLUSTER_IPFS_PROXY_API_URL: 'http://127.0.0.1:9095/api/v0/',
  CLUSTER_BASIC_AUTH_TOKEN: 'dGVzdDp0ZXN0',
  S3_BUCKET_ENDPOINT: 'http://127.0.0.1:9000',
  S3_BUCKET_NAME: 'dotstorage-test-0',
  S3_BUCKET_REGION: 'us-east-1',
  S3_ACCESS_KEY_ID: 'minioadmin',
  S3_SECRET_ACCESS_KEY_ID: 'minioadmin',
  DATABASE: 'postgres',
  PG_REST_URL: 'http://localhost:3000',
  RO_PG_CONNECTION: 'postgres://postgres:postgres@127.0.0.1:5432/postgres',
  PG_CONNECTION: 'postgres://postgres:postgres@127.0.0.1:5432/postgres',
  PG_REST_JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMzk2ODgzNCwiZXhwIjoyNTUwNjUzNjM0LCJyb2xlIjoic2VydmljZV9yb2xlIn0.necIJaiP7X2T2QjGeV-FhpkizcNTX8HjDDBAxpgQTEI'
}

/**
 * @param {string} str Data to encode into CAR file.
 */
export async function createCar (str) {
  return await packToBlob({
    input: [new TextEncoder().encode(str)],
    wrapWithDirectory: false
  })
}

describe('cron - pins backup', () => {
  let user, userId, authKey, dbClient, cluster, backup, rwPg, roPg
  const files = [1, 2, 3]
  const fileContentMap = {}
  const cids = []

  beforeEach(async () => {
    dbClient = getDBClient(env)
    roPg = await getPg(env, 'ro')
    rwPg = await getPg(env, 'rw')
    backup = new Backup(env)

    user = await createUser(dbClient)
    userId = parseInt(user._id)
    authKey = parseInt(await createUserAuthKey(dbClient, userId))
    cluster = await getCluster(env)

    const cidsAdd = files.reduce(async (prev, file, i) => {
      await prev
      const fileContent = file.toString().repeat(10 * 1024) // 10KiB
      const { car: carBody } = await createCar(fileContent)

      const { cid } = await cluster.addCAR(carBody)

      cids.push(cid)
      await waitOkPins(cid, cluster, 5000, 500)
      const peerMap = (await cluster.status(cid)).peerMap
      const pins = await getPins(cid, cluster, peerMap)

      await createPsaPinRequest(dbClient, authKey, cid, { pins })
      fileContentMap[cid] = fileContent
    }, Promise.resolve())
    await cidsAdd
  })

  after(async () => {
    await roPg.end()
    await rwPg.end()
  })

  it('should attempt to backup pins to S3', async () => {
    let res = await roPg.query('SELECT * FROM psa_pin_request')
    assert.strictEqual(res.rows.every(row => row.backup_urls.length === 0), true)

    await backup.backupPins({ roPg, rwPg, cluster })
    res = await roPg.query('SELECT * FROM psa_pin_request')
    assert.strictEqual(res.rows.every(row => row.backup_urls.length), true, 'Not all pin requests have a backup!')
    const s3 = getS3Client(env)
    const objsGet = cids.map(async (cid) => {
      return await s3.send(new GetObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: `complete/${cid}.car`
      }))
    })
    const responses = await Promise.all(objsGet)

    const assertContents = responses.map(async r => {
      for await (const file of unpackStream(r.Body)) {
        const chunks = []
        for await (const chunk of file.content()) {
          chunks.push(chunk)
        }
        const originalContent = fileContentMap[file.cid]
        const content = Buffer.concat(chunks).toString()
        assert.strictEqual(originalContent, content, 'Content does not match orginal one')
      }
    })
    await Promise.all(assertContents)
  })
})
