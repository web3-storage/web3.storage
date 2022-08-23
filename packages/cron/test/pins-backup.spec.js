/* eslint-env mocha */
import { createPsaPinRequest, createUser, createUserAuthKey } from '@web3-storage/db/test-utils'
import { backupPins } from '../src/jobs/pins-backup.js'
import { getCluster, getDBClient } from '../src/lib/utils.js'

global.fetch = fetch

const env = {
  DEBUG: '*',
  ENV: 'dev',
  CLUSTER_API_URL: 'http://localhost:9094',
  CLUSTER_IPFS_PROXY_API_URL: 'http://127.0.0.1:9095/api/v0/',
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

describe('cron - pins backup', () => {
  let user, userId, authKey, dbClient, cluster
  const cids = ['bafy1', 'bafy3', 'bafy4']

  beforeEach(async () => {
    dbClient = getDBClient(env)
    cluster = getCluster(env)

    user = await createUser(dbClient)
    userId = parseInt(user._id)
    authKey = parseInt(await createUserAuthKey(dbClient, userId))

    // Create 3 uploads with 1 pin in status Pinning
    await createPsaPinRequest(dbClient, authKey, cids[0], { pins: uploadPins })
    await createPsaPinRequest(dbClient, authKey, cids[1], { pins: uploadPins })
    await createPsaPinRequest(dbClient, authKey, cids[2], { pins: uploadPins })

    dbClient.query('UPDATE pin SET (status) VALUES (\'Pinned\') WHERE content_cid IN ($1, $2, $3)', cids)
  })

  it('should attempt to backup pins to S3', async () => {
    await backupPins(env, dbClient, dbClient, cluster)
  })
})
