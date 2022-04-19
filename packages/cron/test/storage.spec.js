/* eslint-env mocha */
import {
  createUser,
  createUserAuthKey,
  createUpload,
  createPsaPinRequest
} from '../../db/test/utils.js'
import execa from 'execa'
import assert from 'assert'
import { getDBClient } from '../src/lib/utils.js'
import { EMAIL_TYPE } from '@web3-storage/db'

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
  const dbClient = getDBClient(env)
  let user1, user2, user3, user4, authKey1, authKey2, authKey3, authKey4
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
  const largeFileSize = 3199023255550
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
    await createUser(dbClient, {
      name: 'admin',
      email: 'admin@web3.storage'
    })

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

    await dbClient.createUserTag(Number(user4._id), {
      tag: 'StorageLimitBytes',
      value: '2199023255552'
    })

    const cid = 'bafybeibvuy3vcepqxy4plr34twv22vvxol2jjhmjxcrcvuhea5226whpsm'
    await createUpload(dbClient, Number(user4._id), Number(authKey4), cid, {
      dagSize: largeFileSize
    })
  })

  it('can be executed', async () => {
    const { stderr: emailLog1 } = await execa('./src/bin/storage.js', { env })
    const log1Lines = emailLog1.split('\n')
    assert.match(log1Lines[0], /storage:checkStorageUsed 🗄 Checking users storage quotas/)
    assert.match(log1Lines[1], /email:EmailService 📧 Sending a quota exceeded email to admin/)
    assert.match(log1Lines[2], /email:EmailService 📧 Sending a quota exceeded email to test4-name: 145% of quota used/)
    assert.match(log1Lines[3], /email:EmailService 📧 Sending an email to test3-name: 90% of quota used/)
    assert.match(log1Lines[4], /email:EmailService 📧 Sending an email to test2-name: 79% of quota used/)
    assert.match(log1Lines[5], /storage:checkStorageUsed ✅ Done/)

    const adminUser = await dbClient.getUserByEmail('admin@web3.storage')
    assert.ok(adminUser, 'admin user found')
    const adminStorageExceeded = await dbClient.emailHasBeenSent({
      userId: Number(adminUser._id),
      emailType: EMAIL_TYPE.AdminStorageExceeded,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(adminStorageExceeded, true, 'Admin storage exceeded email sent')

    const over100EmailSent = await dbClient.emailHasBeenSent({
      userId: Number(user4._id),
      emailType: EMAIL_TYPE.User100PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over100EmailSent, true, 'Over 100% email sent')

    const over90EmailSent = await dbClient.emailHasBeenSent({
      userId: Number(user3._id),
      emailType: EMAIL_TYPE.User90PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over90EmailSent, true, 'Over 90% email sent')

    const over75EmailSent = await dbClient.emailHasBeenSent({
      userId: Number(user2._id),
      emailType: EMAIL_TYPE.User75PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over75EmailSent, true, 'Over 75% email sent')

    const { stderr: emailLog2 } = await execa('./src/bin/storage.js', { env })
    const log2Lines = emailLog2.split('\n')
    assert.match(log2Lines[0], /storage:checkStorageUsed 🗄 Checking users storage quotas/)
    assert.match(log2Lines[1], /storage:checkStorageUsed ✅ Done/)
  })
})
