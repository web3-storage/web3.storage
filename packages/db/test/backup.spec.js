/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index.js'
import { token } from './utils.js'

describe('backup', () => {
  /** @type {DBClient} */
  const client = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token,
    postgres: true
  })
  let user

  const cid = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354'
  const type = 'Upload'
  const dagSize = 1000
  const name = `Upload_${new Date().toISOString()}`
  const initialBackupUrl = `https://backup.cid/${new Date().toISOString()}/${Math.random()}`
  const initialPinData = {
    status: 'Pinning',
    location: {
      peerId: 'peer_id',
      peerName: 'peer_name',
      ipfsPeerId: 'ipfs_peer_id',
      region: 'region'
    }
  }
  let authKeys
  let upload

  // Setup testing user
  beforeEach(async () => {
    const name = 'test-name'
    const email = 'test@email.com'
    const issuer = `issuer${Math.random()}`
    const publicAddress = `public_address${Math.random()}`

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
  })

  // Create auth key
  beforeEach(async () => {
    const name = 'test-key-name'
    const secret = 'test-secret'
    await client.createKey({
      name,
      secret,
      user: user._id
    })
  })

  // Setup upload
  beforeEach(async () => {
    authKeys = await client.listKeys(user._id)
    const createdUpload = await client.createUpload({
      user: user._id,
      contentCid: cid,
      sourceCid: cid,
      authKey: authKeys[0]._id,
      type,
      dagSize: dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [initialBackupUrl]
    })

    assert(createdUpload, 'upload created')
    assert(createdUpload.cid, 'upload has root cid')

    upload = await client.getUpload(cid, user._id)

    assert(upload, 'upload created')
  })

  it('can get upload backups', async () => {
    const backups = await client.getBackups(upload._id)

    assert(backups, 'backups created')
    assert.strictEqual(backups.length, 1, 'upload has a single backup')
    assert(backups[0].created, 'backup has inserted timestamp')
    assert.strictEqual(backups[0].url, initialBackupUrl, 'backup has correct url')
  })

  it('backup urls are unique', async () => {
    await client.createUpload({
      user: user._id,
      contentCid: cid,
      sourceCid: cid,
      authKey: authKeys[0]._id,
      type,
      dagSize: dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [initialBackupUrl]
    })

    upload = await client.getUpload(cid, user._id)
    assert(upload, 'second upload created')

    const backups = await client.getBackups(upload._id)

    assert.strictEqual(backups.length, 1, 'upload has a single backup')
    assert(new Date(backups[0].created) < new Date(upload.updated), 'backup was created before the new upload')
  })

  it('can backup chunked uploads', async () => {
    const backupUrlSecondChunk = `https://backup.cid/${new Date().toISOString()}/${Math.random()}`

    await client.createUpload({
      user: user._id,
      contentCid: cid,
      sourceCid: cid,
      authKey: authKeys[0]._id,
      type,
      dagSize: dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [backupUrlSecondChunk]
    })

    const upload = await client.getUpload(cid, user._id)
    assert(upload, 'upload created')

    const backups = await client.getBackups(upload._id)
    assert.strictEqual(backups.length, 2, 'upload has a two backups')

    const backupUrls = backups.map(backup => backup.url).sort()
    const expectedBackupUrls = [initialBackupUrl, backupUrlSecondChunk].sort()
    assert.equal(backupUrls[0], expectedBackupUrls[0])
    assert.equal(backupUrls[1], expectedBackupUrls[1])
  })
})
