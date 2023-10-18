/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index.js'
import { createUpload, token } from './utils.js'

describe('user operations', () => {
  const name = 'test-name'
  const email = 'test@email.com'
  const issuer = `issuer${Math.random()}`
  const publicAddress = `public_address${Math.random()}`

  /** @type {DBClient} */
  const client = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token,
    postgres: true
  })
  let user

  // Setup testing user
  beforeEach(async () => {
    const upsertUser = await client.upsertUser({
      name,
      email,
      issuer,
      publicAddress
    })

    assert(upsertUser, 'user created')
    assert.strictEqual(upsertUser.inserted, true, 'upsertUser.inserted is truthy, indicating a new row was inserted')
    assert.strictEqual(upsertUser.issuer, issuer, 'user has correct issuer')

    // Get previously created user
    user = await client.getUser(issuer)

    assert(user, 'user fetched by issuer')
    assert(user._id, 'user has id')
    assert(user.created, 'user has created timestamp')
    assert(user.updated, 'user has updated timestamp')
    assert.strictEqual(user.name, name, 'user has correct name')
    assert.strictEqual(user.email, email, 'user has correct email')
    assert.strictEqual(user.issuer, issuer, 'user has correct issuer')
    assert.strictEqual(user.publicAddress, publicAddress, 'user has correct public address')
  })

  it('should return undefined to get a non existing user', async () => {
    const user = await client.getUser('fake-issuer')
    assert.strictEqual(user, undefined)
  })

  it('should update user with same issuer (login)', async () => {
    const name = 'test-name-different'
    const email = 'test-different@email.com'
    const issuer = user.issuer // same issuer as previously created
    const publicAddress = `public_address-different${Math.random()}`

    const upsertUser = await client.upsertUser({
      name,
      email,
      issuer,
      publicAddress
    })
    assert(upsertUser, 'user updated')
    assert.strictEqual(upsertUser.inserted, false, 'upsertUser.inserted is falsy, indicating a row was updated')
  })

  it('can update previously created user', async () => {
    const name = 'test-name'
    const email = 'new-test@email.com'
    const publicAddress = `public_address${Math.random()}`

    const upsertUser = await client.upsertUser({
      id: user._id,
      name,
      email,
      issuer: user.issuer,
      publicAddress
    })

    assert(upsertUser, 'user updated')

    const updatedUser = await client.getUser(user.issuer)
    assert.strictEqual(updatedUser.email, email, 'user has new email')
    assert.strictEqual(updatedUser._id, user._id, 'user has same id')
    assert.strictEqual(updatedUser.created, user.created, 'user has same created timestamp')
  })

  it('should return undefined to get non existing key for user', async () => {
    const secret = 'test-secret-fail'
    const fetchedKey = await client.getKey(user.issuer, secret)

    assert.strictEqual(fetchedKey, undefined)
  })

  it('can create auth keys for user', async () => {
    const name = 'test-key-name'
    const secret = 'test-secret'
    const authKey = await client.createKey({
      name,
      secret,
      user: user._id
    })

    assert(authKey, 'auth key created')
    assert(authKey._id, 'auth key id')

    const fetchedKey = await client.getKey(user.issuer, secret)
    assert(fetchedKey, 'auth key created')
    assert.strictEqual(fetchedKey._id, authKey._id)

    const keys = await client.listKeys(user._id)

    assert(keys, 'keys received')
    assert.strictEqual(keys.length, 1, 'user has an auth key')
    assert.strictEqual(keys[0].name, name, 'auth key has expect name')
    assert.strictEqual(keys[0].secret, secret, 'auth key has expect secret')
    assert.strictEqual(keys[0].hasUploads, false, 'auth key do not have uploads')
  })

  it('can delete auth keys from user', async () => {
    const name = 'test-key-name-2'
    const secret = 'test-secret'
    const authKey = await client.createKey({
      name,
      secret,
      user: user._id
    })

    const keys = await client.listKeys(user._id)

    // Delete previously created key
    const { _id } = await client.deleteKey(user._id, authKey._id)
    assert(_id, 'key deleted')

    const { data: deletedKey } = await client._client
      .from('auth_key')
      .select('*')
      .eq('id', _id)
      .single()
    assert.strictEqual(deletedKey.updated_at, deletedKey.deleted_at)

    const finalKeys = await client.listKeys(user._id)
    assert(finalKeys, 'final keys fetched')
    assert.deepEqual(finalKeys.length, keys.length - 1, 'user had auth key deleted')

    // Should fail to delete again
    let error
    try {
      await client.deleteKey(user._id, authKey._id)
    } catch (err) {
      error = err
    }
    assert(error, 'should fail to delete auth key again')
  })

  it('does not list deleted keys by default', async () => {
    const name = 'test-key-name-2'
    const secret = 'test-secret'
    const authKey1 = await client.createKey({
      name,
      secret,
      user: user._id
    })

    const authKey2 = await client.createKey({
      name,
      secret,
      user: user._id
    })

    const authKey3 = await client.createKey({
      name,
      secret,
      user: user._id
    })

    const notDeletedKeys = [authKey1._id, authKey2._id]

    await client.deleteKey(user._id, authKey3._id)

    const keys = await client.listKeys(user._id)

    assert.strictEqual(keys.length, 2, 'should list only not deleted by default')
    assert(keys.every(item => notDeletedKeys.includes(item._id)))
  })

  it('lists deleted keys if requested', async () => {
    const name = 'test-key-name-2'
    const secret = 'test-secret'
    const authKey1 = await client.createKey({
      name,
      secret,
      user: user._id
    })

    const authKey2 = await client.createKey({
      name,
      secret,
      user: user._id
    })

    const authKey3 = await client.createKey({
      name,
      secret,
      user: user._id
    })

    const notDeletedKeys = [authKey1._id, authKey2._id, authKey3._id]

    await client.deleteKey(user._id, authKey3._id)

    const keys = await client.listKeys(user._id, { includeDeleted: true })

    assert.strictEqual(keys.length, 3, 'should list only not deleted by default')
    assert(keys.every(item => notDeletedKeys.includes(item._id)))
  })

  it('can track user used storage and has uploads', async () => {
    const authKey = await client.createKey({
      name: 'test-key-name-3',
      secret: 'test-secret-3',
      user: user._id
    })

    const emptyUsedStorage = await client.getStorageUsed(user._id)
    assert.deepEqual(emptyUsedStorage.total, 0, 'received empty used storage')
    assert.strictEqual(emptyUsedStorage.uploaded, 0, 'empty used storage for uploaded')
    assert.strictEqual(emptyUsedStorage.psaPinned, 0, 'empty used storage for pinned')

    // Create Upload 1
    const cid1 = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47fgf111'
    const dagSize1 = 10000
    await createUpload(client, user._id, authKey._id, cid1, {
      dagSize: dagSize1
    })

    const firstUsedStorage = await client.getStorageUsed(user._id)
    assert.strictEqual(firstUsedStorage.uploaded, dagSize1, 'used storage with first upload')

    // Create Upload 2
    const cid2 = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47fgf112'
    const dagSize2 = 30000

    await createUpload(client, user._id, authKey._id, cid2, {
      dagSize: dagSize2
    })

    const secondUsedStorage = await client.getStorageUsed(user._id)
    assert.strictEqual(secondUsedStorage.uploaded, dagSize1 + dagSize2, 'used storage with second upload')

    // Confirm auth key has uploads
    const userKeys = await client.listKeys(user._id)
    assert.strictEqual(userKeys.find(k => k.hasUploads)._id, authKey._id)

    // Delete Upload 2
    await client.deleteUpload(user._id, cid2)

    const thirdUsedStorage = await client.getStorageUsed(user._id)
    assert.strictEqual(thirdUsedStorage.uploaded, dagSize1, 'used storage with only first upload again')
  })

  it('can createUserAgreement of web3.storage terms of service', async () => {
    const agreement = /** @type {const} */ ('web3.storage-tos-v1')
    await client.createUserAgreement(user._id, agreement)
    // can create a second time. it will append another record of the second agreement with its own timestamp
    await client.createUserAgreement(user._id, agreement)
  })

  it('can check if given token is blocked when not existent', async () => {
    const now = Date.now()
    const authToken = await client.createKey({
      name: `test-key-name-${now}`,
      secret: `test-secret-${now}`,
      user: user._id
    })

    const res = await client.checkIsTokenBlocked(authToken)
    assert.equal(res, false)
  })
})
