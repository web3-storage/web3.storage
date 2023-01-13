/* eslint-env mocha */
import assert from 'assert'
import { createUpload, getUpload, createUser, createUserAuthKey, getPinSyncRequests } from '@web3-storage/db/test-utils'
import fetch from '@web-std/fetch'
import { getCluster, getDBClient } from '../src/lib/utils.js'
import { updatePinStatuses } from '../src/jobs/pins.js'

global.fetch = fetch

const env = {
  DEBUG: '*',
  ENV: 'dev',
  CLUSTER_API_URL: 'http://localhost:9094',
  CLUSTER_BASIC_AUTH_TOKEN: 'dGVzdDp0ZXN0',
  DATABASE: 'postgres',
  PG_REST_URL: 'http://localhost:3000',
  PG_REST_JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMzk2ODgzNCwiZXhwIjoyNTUwNjUzNjM0LCJyb2xlIjoic2VydmljZV9yb2xlIn0.necIJaiP7X2T2QjGeV-FhpkizcNTX8HjDDBAxpgQTEI'
}

const peerId = '1'
const peerName = '1'
const ipfsPeerId = '1'
const region = '1'

const uploadPins = [{
  status: 'Pinning',
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

describe.skip('cron - pins', () => {
  let user, userId, authKey, dbClient, cluster
  const cids = ['bafy1', 'bafy3', 'bafy4']

  beforeEach(async () => {
    dbClient = getDBClient(env)
    cluster = getCluster(env)

    user = await createUser(dbClient)
    userId = parseInt(user._id)
    authKey = parseInt(await createUserAuthKey(dbClient, userId))

    // Create 3 uploads with 1 pin in status Pinning
    await createUpload(dbClient, userId, authKey, cids[0], { pins: uploadPins })
    await createUpload(dbClient, userId, authKey, cids[1], { pins: uploadPins })
    await createUpload(dbClient, userId, authKey, cids[2], { pins: uploadPins })

    // Override cluster statys to return pinned
    cluster.status = async (cid) => {
      return createPin(cid, 'pinned')
    }

    // Override cluster statusAll to return pinned
    cluster.statusAll = async ({ cids }) => {
      return cids.map(cid => createPin(cid, 'pinned'))
    }
  })

  it('can be executed', async () => {
    let pinRequests = await getPinSyncRequests(dbClient)
    assert.strictEqual(pinRequests.data.length, 3)

    await updatePinStatuses({ cluster, db: dbClient })

    const uploads = await Promise.all(cids.map(cid => getUpload(dbClient, cid, user._id)))

    uploads.forEach((u) => {
      const pin = u.pins.find(p => p.peerId === peerId)
      assert.strictEqual(pin.status, 'Pinned', 'Did not update the pin statuses')
    })

    pinRequests = await getPinSyncRequests(dbClient)
    assert.strictEqual(pinRequests.data.length, 0, 'Did not delete the pin requests')
  })
})
