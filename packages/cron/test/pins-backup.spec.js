/* eslint-env mocha */
import { createPsaPinRequest, createUser, createUpload, createUserAuthKey, randomCid } from '@web3-storage/db/test-utils'
import Backup from '../src/jobs/pins-backup.js'
import assert from 'assert'
import { getCluster, getDBClient, getPg } from '../src/lib/utils.js'
import sinon from 'sinon'
import fetch from '@web-std/fetch'

global.fetch = fetch

const env = {
  DEBUG: 'backup:pins',
  ENV: 'dev',
  CLUSTER_API_URL: 'http://localhost:9094',
  CLUSTER_IPFS_PROXY_API_URL: 'http://127.0.0.1:9095/api/v0/',
  CLUSTER_BASIC_AUTH_TOKEN: 'dGVzdDp0ZXN0',
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

const uploadPins = [{
  status: 'Pinned',
  location: {
    peerId,
    peerName,
    ipfsPeerId,
    region
  }
}]

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

describe('cron - pins backup', () => {
  let user, userId, authKey, dbClient, cluster, backup, rwPg, roPg
  const cids = []

  beforeEach(async () => {
    dbClient = getDBClient(env)
    cluster = getCluster(env)
    roPg = await getPg(env, 'ro')
    rwPg = await getPg(env, 'rw')
    backup = new Backup(env)

    user = await createUser(dbClient)
    userId = parseInt(user._id)
    authKey = parseInt(await createUserAuthKey(dbClient, userId))

    cids[0] = await randomCid()
    cids[1] = await randomCid()
    cids[2] = await randomCid()

    // Create 3 uploads with status Pinned
    await createUpload(dbClient, userId, authKey, cids[0], { pins: uploadPins })
    await createUpload(dbClient, userId, authKey, cids[1], { pins: uploadPins })
    await createUpload(dbClient, userId, authKey, cids[2], { pins: uploadPins })
    await createPsaPinRequest(dbClient, authKey, cids[0], { pins: uploadPins })
    await createPsaPinRequest(dbClient, authKey, cids[1], { pins: uploadPins })
    await createPsaPinRequest(dbClient, authKey, cids[2], { pins: uploadPins })

    const exportCarStub = sinon.stub(backup, 'exportCar')

    exportCarStub.onCall(0).returns(async function * () {
      yield {
        content: Buffer.from('test file'),
        contentCid: cids[0],
        sourceCid: cids[0]
      }
    })
    exportCarStub.onCall(1).returns(async function * () {
      yield {
        content: Buffer.from('test file'),
        contentCid: cids[1],
        sourceCid: cids[1]
      }
    })
    exportCarStub.onCall(2).returns(async function * () {
      yield {
        content: Buffer.from('test file'),
        contentCid: cids[2],
        sourceCid: cids[2]
      }
    })

    const uploadCarStub = sinon.stub(backup, 'uploadCar')

    uploadCarStub.onCall(0).returns(async function * () {
      yield {
        content: Buffer.from('test file'),
        contentCid: cids[0],
        sourceCid: cids[0],
        backupUrl: `https://test.s3.eu-west-1.amazonaws.com/my-car/${cids[0]}`
      }
    })
    uploadCarStub.onCall(1).returns(async function * () {
      yield {
        content: Buffer.from('test file'),
        contentCid: cids[1],
        sourceCid: cids[1],
        backupUrl: `https://test.s3.eu-west-1.amazonaws.com/my-car/${cids[1]}`
      }
    })
    uploadCarStub.onCall(2).returns(async function * () {
      yield {
        content: Buffer.from('test file'),
        contentCid: cids[2],
        sourceCid: cids[2],
        backupUrl: `https://test.s3.eu-west-1.amazonaws.com/my-car/${cids[2]}`
      }
    })

    // Override cluster statys to return pinned
    cluster.status = async (cid) => {
      return createPin(cid, 'pinned')
    }

    // Override cluster statusAll to return pinned
    cluster.statusAll = async ({ cids }) => {
      return cids.map(cid => createPin(cid, 'pinned'))
    }
  })

  after(async () => {
    await roPg.end()
    await rwPg.end()
  })

  it('should attempt to backup pins to S3', async () => {
    await backup.backupPins({ roPg, rwPg, cluster })
    const res = await roPg.query('SELECT * FROM psa_pin_request')
    assert.strictEqual(res.rows.every(row => row.backup_urls), true, 'Not all pin requests have a backup!')
  })
})
