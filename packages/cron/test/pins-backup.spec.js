/* eslint-env mocha */
import { createPsaPinRequest, createUser, createUpload, createUserAuthKey, randomCid } from '@web3-storage/db/test-utils'
import Backup from '../src/jobs/pins-backup.js'
import assert from 'assert'
import { getCluster, getDBClient, getPg, getS3Client } from '../src/lib/utils.js'
import fetch from '@web-std/fetch'
import { GetObjectCommand } from '@aws-sdk/client-s3'

import { packToBlob } from 'ipfs-car/pack/blob'
import { getPins, waitOkPins } from './pins-utils.js'

global.fetch = fetch

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

const peerId = '1'
const peerName = '1'
const ipfsPeerId = '1'
const region = '1'

/**
 *
 * @param {string} cid
 * @param {import('@nftstorage/ipfs-cluster/src/interface').TrackerStatus} status
 * @returns
 */
const createPin = (cid, status = 'pinned') => {
  /**
   * @type {import('@nftstorage/ipfs-cluster/src/interface').StatusResponse}
   */
  const pin = {
    cid,
    name: peerName,
    peerMap: {
      [ipfsPeerId]: {
        peerName,
        ipfsPeerId,
        status: status,
        timestamp: new Date(),
        error: null
      }
    }
  }
  return pin
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

      const { root, car: carBody } = await createCar(file)

      const { cid } = await cluster.addCAR(carBody)

      cids.push(cid)

      await waitOkPins(cid, cluster)
      const peerMap = (await cluster.status(cid)).peerMap
      const pins = await getPins(cid, cluster, peerMap)
      await createPsaPinRequest(dbClient, authKey, cid, { pins })
    }, Promise.resolve())
    await cidsAdd

    // const uploadPins = [{
    //   status: 'Pinned',
    //   location: {
    //     peerId,
    //     peerName,
    //     ipfsPeerId,
    //     region
    //   }
    // }]

    // // const pins = await getPins(cid, env.cluster)

    // // Create 3 pins with status Pinned
    // await createPsaPinRequest(dbClient, authKey, cids[0], { pins: uploadPins })
    // await createPsaPinRequest(dbClient, authKey, cids[1], { pins: uploadPins })
    // await createPsaPinRequest(dbClient, authKey, cids[2], { pins: uploadPins })

    // // const exportCarStub = sinon.stub(backup, 'exportCar')

    // exportCarStub.onCall(0).returns(async function * () {
    //   yield {
    //     content: Buffer.from('test file'),
    //     contentCid: cids[0],
    //     sourceCid: cids[0]
    //   }
    // })
    // exportCarStub.onCall(1).returns(async function * () {
    //   yield {
    //     content: Buffer.from('test file'),
    //     contentCid: cids[1],
    //     sourceCid: cids[1]
    //   }
    // })
    // exportCarStub.onCall(2).returns(async function * () {
    //   yield {
    //     content: Buffer.from('test file'),
    //     contentCid: cids[2],
    //     sourceCid: cids[2]
    //   }
    // })

    // const uploadCarStub = sinon.stub(backup, 'uploadCar')

    // uploadCarStub.onCall(0).returns(async function * () {
    //   yield {
    //     content: Buffer.from('test file'),
    //     contentCid: cids[0],
    //     sourceCid: cids[0],
    //     backupUrl: `https://test.s3.eu-west-1.amazonaws.com/my-car/${cids[0]}`
    //   }
    // })
    // uploadCarStub.onCall(1).returns(async function * () {
    //   yield {
    //     content: Buffer.from('test file'),
    //     contentCid: cids[1],
    //     sourceCid: cids[1],
    //     backupUrl: `https://test.s3.eu-west-1.amazonaws.com/my-car/${cids[1]}`
    //   }
    // })
    // uploadCarStub.onCall(2).returns(async function * () {
    //   yield {
    //     content: Buffer.from('test file'),
    //     contentCid: cids[2],
    //     sourceCid: cids[2],
    //     backupUrl: `https://test.s3.eu-west-1.amazonaws.com/my-car/${cids[2]}`
    //   }
    // })

    // // Override cluster status to return pinned
    // cluster.status = async (cid) => {
    //   return createPin(cid, 'pinned')
    // }

    // // Override cluster statusAll to return pinned
    // cluster.statusAll = async ({ cids }) => {
    //   return cids.map(cid => createPin(cid, 'pinned'))
    // }
  })

  after(async () => {
    await roPg.end()
    await rwPg.end()
  })

  it('should attempt to backup pins to S3', async () => {
    let res = await roPg.query('SELECT * FROM psa_pin_request')
    assert.strictEqual(res.rows.every(row => row.backup_urls.length === 0), true, 'Not all pin requests have a backup!')

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
    await Promise.all(objsGet)
  })
})
