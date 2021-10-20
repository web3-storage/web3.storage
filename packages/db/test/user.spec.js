/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'
import { token } from './utils.js'

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
  before(async () => {
    const upsertUser = await client.upsertUser({
      name,
      email,
      issuer,
      publicAddress
    })

    assert(upsertUser, 'user created')
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

  it('should fail to get a non existing user', async () => {
    try {
      await client.getUser('fake-issuer')
    } catch (err) {
      assert(err, 'errored to get a non existing user')
      return
    }
    throw new Error('should fail to get a non existing user')
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
    await client.deleteKey(user._id, authKey._id)

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

  it('can track user used storage and has uploads', async () => {
    const authKey = await client.createKey({
      name: 'test-key-name-3',
      secret: 'test-secret-3',
      user: user._id
    })

    const emptyUsedStorage = await client.getUsedStorage(user._id)
    assert.deepEqual(emptyUsedStorage, 0, 'received empty used storage')

    // Create Upload 1
    const cid1 = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47fgf111'
    const dagSize1 = 10000
    await client.createUpload({
      user: user._id,
      contentCid: cid1,
      sourceCid: cid1,
      authKey: authKey._id,
      type: 'Upload',
      dagSize: dagSize1,
      pins: [],
      backupUrls: []
    })

    const firstUsedStorage = await client.getUsedStorage(user._id)
    assert.deepEqual(firstUsedStorage, dagSize1, 'used storage with first upload')

    // Create Upload 2
    const cid2 = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47fgf112'
    const dagSize2 = 30000
    await client.createUpload({
      user: user._id,
      contentCid: cid2,
      sourceCid: cid2,
      authKey: authKey._id,
      type: 'Upload',
      dagSize: dagSize2,
      pins: [],
      backupUrls: []
    })

    const secondUsedStorage = await client.getUsedStorage(user._id)
    assert.deepEqual(secondUsedStorage, dagSize1 + dagSize2, 'used storage with second upload')

    // Confirm auth key has uploads
    const userKeys = await client.listKeys(user._id)
    assert.strictEqual(userKeys.find(k => k.hasUploads)._id, authKey._id)

    // Delete Upload 2
    await client.deleteUpload(user._id, cid2)

    const thirdUsedStorage = await client.getUsedStorage(user._id)
    assert.deepEqual(thirdUsedStorage, dagSize1, 'used storage with only first upload again')
  })
})
