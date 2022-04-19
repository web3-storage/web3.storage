/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index.js'
import {
  createUser,
  createUserAuthKey,
  createUpload,
  createPsaPinRequest,
  token,
  randomCid
} from './utils.js'

describe('Users used storage', () => {
  /** @type {DBClient} */
  const dbClient = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token,
    postgres: true
  })

  let user1, user2, user3, user4, user5
  let authKey1, authKey2, authKey3, authKey4, authKey5
  let cid
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
    user1 = await createUser(dbClient, {
      name: 'test1-name',
      email: 'test1@email.com'
    })
    authKey1 = await createUserAuthKey(dbClient, Number(user1._id), {
      name: 'test1-key'
    })
    cid = await randomCid()
    await createUpload(dbClient, Number(user1._id), Number(authKey1), cid, {
      dagSize: uploadSize
    })
    cid = await randomCid()
    await createPsaPinRequest(dbClient, authKey1, cid, {
      dagSize: pinnedSize,
      pins
    })
    cid = await randomCid()
    await createPsaPinRequest(dbClient, authKey1, cid, {
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
    cid = await randomCid()
    await createUpload(dbClient, Number(user2._id), Number(authKey2), cid, {
      dagSize: uploadSize
    })
    cid = await randomCid()
    await createUpload(dbClient, Number(user2._id), Number(authKey2), cid, {
      dagSize: uploadSize
    })

    user3 = await createUser(dbClient, {
      name: 'test3-name',
      email: 'test3@email.com'
    })
    authKey3 = await createUserAuthKey(dbClient, Number(user3._id), {
      name: 'test3-key'
    })
    cid = await randomCid()
    await createUpload(dbClient, Number(user3._id), Number(authKey3), cid, {
      dagSize: uploadSize
    })
    cid = await randomCid()
    await createUpload(dbClient, Number(user3._id), Number(authKey3), cid, {
      dagSize: Math.round(uploadSize * 1.1)
    })
    cid = await randomCid()
    await createPsaPinRequest(dbClient, authKey3, cid, {
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
    cid = await randomCid()
    await createUpload(dbClient, Number(user4._id), Number(authKey4), cid, {
      dagSize: largeFileSize
    })

    user5 = await createUser(dbClient, {
      name: 'test5 restricted',
      email: 'test5@email.com'
    })
    authKey5 = await createUserAuthKey(dbClient, Number(user5._id), {
      name: 'test5-key'
    })
    await dbClient.createUserTag(Number(user5._id), {
      tag: 'StorageLimitBytes',
      value: '2199023255552'
    })
    await dbClient.createUserTag(Number(user5._id), {
      tag: 'HasAccountRestriction',
      value: 'true'
    })
    await dbClient.createUserTag(Number(user5._id), {
      tag: 'HasPsaAccess',
      value: 'true'
    })
    cid = await randomCid()
    await createUpload(dbClient, Number(user5._id), Number(authKey5), cid, {
      dagSize: largeFileSize
    })

    // User               | upload  | pinned  | quota   | percentage of quota
    // ----------------------------------------------------------------------
    // test1@email.com    | 1       | 2       | 1TiB    | < 75%
    // test2@email.com    | 2       | 0       | 1TiB    | 80%
    // test3@email.com    | 2       | 1       | 1TiB    | 90%
    // test4@email.com    | 1 (XL)  | 0       | 2TiB    | > 90%
    // test5@email.com    | 1 (XL)  | 0       | 2TiB    | ACCOUNT RESTRICTED
  })

  it('returns user details needed for email', async () => {
    const users = await dbClient.getUsersByStorageUsed({
      fromPercent: 50
    })

    assert.strictEqual(users.length, 4, 'All users returned')
    assert(users[0].name, 'User has a name')
    assert(users[0].email, 'User has an email')
    assert(users[0].storageQuota, 'User has storage quota')
    assert(users[0].storageUsed, 'User has storage quota used')
  })

  it('retrieves correct users in a range', async () => {
    const users = await dbClient.getUsersByStorageUsed({
      fromPercent: 70,
      toPercent: 95
    })
    assert.strictEqual(users.length, 2, 'Users with quota in a range')
    assert.strictEqual(users[0].email, 'test3@email.com')
    assert.strictEqual(users[1].email, 'test2@email.com')
  })

  it('retrieves users sorted by used storage descending', async () => {
    const users = await dbClient.getUsersByStorageUsed({
      fromPercent: 50,
      toPercent: 95
    })
    assert.strictEqual(users.length, 3, 'Users with quota in a range')
    assert.strictEqual(users[0].email, 'test3@email.com', 'Sorted by used storage descending')
    assert.strictEqual(users[1].email, 'test2@email.com')
    assert.strictEqual(users[2].email, 'test1@email.com')
  })

  it('uses user quota instead of default if one has been specified', async () => {
    const users = await dbClient.getUsersByStorageUsed({
      fromPercent: 90
    })
    assert.strictEqual(users.length, 2, 'Users with non-default quota included')
    assert.strictEqual(users[0].email, 'test4@email.com')
    assert.strictEqual(users[1].email, 'test3@email.com')
  })
})
