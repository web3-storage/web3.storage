/* eslint-env mocha */
import {
  createUser,
  createUserAuthKey,
  createUserTag,
  createUpload,
  createPsaPinRequest
} from '../../db/test/utils.js'
import execa from 'execa'
import assert from 'assert'
import { getDBClient } from '../src/lib/utils.js'

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

describe('cron - check user storage quotas', () => {
  let dbClient, user1, user2, user3, user4, authKey1, authKey2, authKey3, authKey4
  const cids = [
    'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47fgf111',
    'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47fgf112',
    'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47fgf113'
  ]
  const cidsPinned = [
    'QmdA5WkDNALetBn4iFeSepHjdLGJdxPBwZyY47ir1bZGAK',
    'QmNvTjdqEPjZVWCvRWsFJA1vK7TTw1g9JP6we1WBJTRADM'
  ]
  const uploadSize = 439804651110
  const pinnedSize = 109951162800
  const largeFileSize = 2199023255550
  const pins = [
    {
      status: 'Pinning',
      location: {
        peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
        peerName: 'web3-storage-sv15',
        region: 'region'
      }
    },
    {
      status: 'Pinned',
      location: {
        peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK7',
        peerName: 'web3-storage-sv16',
        region: 'region'
      }
    }
  ]

  beforeEach(async () => {
    dbClient = getDBClient(env)
    user1 = await createUser(dbClient, {
      name: 'test1-name',
      email: 'test1@email.com'
    })
    authKey1 = await createUserAuthKey(dbClient, Number(user1._id), {
      name: 'test1-key'
    })
    await createUpload(dbClient, Number(user1._id), Number(authKey1), cids[0], {
      dagSize: uploadSize
    })
    await createPsaPinRequest(dbClient, authKey1, cidsPinned[0], {
      dagSize: pinnedSize,
      pins
    })
    await createPsaPinRequest(dbClient, authKey1, cidsPinned[1], {
      dagSize: pinnedSize,
      pins
    })

    user2 = await createUser(dbClient, {
      name: 'test2-name',
      email: 'test2@email.com'
    })
    authKey2 = await createUserAuthKey(dbClient, Number(user2._id), {
      name: 'test2-key'
    })
    await createUpload(dbClient, Number(user2._id), Number(authKey2), cids[0], {
      dagSize: uploadSize
    })
    await createUpload(dbClient, Number(user2._id), Number(authKey2), cids[1], {
      dagSize: uploadSize
    })

    user3 = await createUser(dbClient, {
      name: 'test3-name',
      email: 'test3@email.com'
    })
    authKey3 = await createUserAuthKey(dbClient, Number(user3._id), {
      name: 'test3-key'
    })
    await createUpload(dbClient, Number(user3._id), Number(authKey3), cids[0], {
      dagSize: uploadSize
    })
    await createUpload(dbClient, Number(user3._id), Number(authKey3), cids[1], {
      dagSize: Math.round(uploadSize * 1.2)
    })
    await createPsaPinRequest(dbClient, authKey3, cidsPinned[0], {
      dagSize: pinnedSize,
      pins
    })

    user4 = await createUser(dbClient, {
      name: 'test4-name',
      email: 'test4@email.com'
    })
    authKey4 = await createUserAuthKey(dbClient, Number(user4._id), {
      name: 'test4-key'
    })
    await createUserTag(dbClient, Number(user4._id), {
      tag: 'StorageLimitBytes',
      value: '2199023255552'
    })
    const cid = 'bafybeibvuy3vcepqxy4plr34twv22vvxol2jjhmjxcrcvuhea5226whpsm'
    await createUpload(dbClient, Number(user4._id), Number(authKey4), cid, {
      dagSize: largeFileSize
    })
  })

  it('can be executed', async () => {
    const { stderr } = await execa('./src/bin/storage.js', { env })
    assert.match(stderr, /storage:checkStorageUsed 🗄 Checking users storage quotas/)
    assert.match(stderr, /storage:checkStorageUsed 📧 Sending an email to test4-name: 100% of quota used/)
    assert.match(stderr, /storage:checkStorageUsed 📧 Sending an email to test3-name: 90% of quota used/)
    assert.match(stderr, /storage:checkStorageUsed 📧 Sending an email to test2-name: 80% of quota used/)
    assert.match(stderr, /storage:checkStorageUsed ✅ Done/)
  })
})
