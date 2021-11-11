/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'
import { token } from './utils.js'

describe('upload', () => {
  /** @type {DBClient} */
  const client = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token,
    postgres: true
  })
  let user

  // Setup testing user
  before(async () => {
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
  before(async () => {
    const name = 'test-key-name'
    const secret = 'test-secret'
    await client.createKey({
      name,
      secret,
      user: user._id
    })
  })

  const cid = 'bafybeiczsscdsbs7ffqz55asqde1qmv6klcw3gofszvwlyarci47bgf354'
  const type = 'Upload'
  const dagSize = 1000
  const name = `Upload_${new Date().toISOString()}`
  const initialBackupUrl = `https://backup.cid/${new Date().toISOString()}/${Math.random()}`
  const initialPinData = {
    status: 'Pinning',
    location: {
      peerId: 'peer_id',
      peerName: 'peer_name',
      region: 'region'
    }
  }
  let authKeys
  let upload

  // Setup first user upload
  before(async () => {
    authKeys = await client.listKeys(user._id)
    const createdUpload = await client.createUpload({
      user: user._id,
      contentCid: cid,
      sourceCid: cid,
      authKey: authKeys[0]._id,
      type,
      dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [initialBackupUrl]
    })

    assert(createdUpload, 'upload created')
    assert(createdUpload.cid, 'upload has root cid')

    upload = await client.getUpload(cid, user._id)

    assert(upload, 'upload created')
    assert(upload._id, 'upload has an id')
    assert(upload.created, 'upload has created timestamp')
    assert(upload.updated, 'upload has updated timestamp')
    assert.strictEqual(upload.type, type, 'upload has correct type')
    assert.strictEqual(upload.name, name, 'upload has correct name')
    assert.strictEqual(upload.cid, cid, 'upload has correct cid')
    assert.strictEqual(upload.dagSize, dagSize, 'upload has correct dag size')
    assert.strictEqual(upload.pins.length, 1, 'upload has one pin')
    assert.strictEqual(upload.pins[0].status, initialPinData.status, 'pin has added status')
    assert.strictEqual(upload.pins[0].peerId, initialPinData.location.peerId, 'pin has added peerId')
    assert.strictEqual(upload.pins[0].peerName, initialPinData.location.peerName, 'pin has added peer name')
    assert.strictEqual(upload.pins[0].region, initialPinData.location.region, 'pin has added region')
    assert.strictEqual(upload.deals.length, 0, 'upload has no deals')
  })

  it('can handle partial uploads', async () => {
    // Create upload follow up
    const followUpCreate = await client.createUpload({
      user: user._id,
      contentCid: cid,
      sourceCid: cid,
      authKey: authKeys[0]._id,
      type,
      dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [
        `https://backup.cid/${new Date().toISOString()}`,
        `https://backup-other-region.cid/${new Date().toISOString()}`
      ] // New backup urls
    })

    assert(followUpCreate, 'follow up upload created')
    assert.strictEqual(followUpCreate._id, upload._id, 'follow up upload has same id')

    const followUpUpload = await client.getUpload(cid, user._id)

    assert(followUpUpload, 'follow up upload created')
    assert.notStrictEqual(followUpUpload.updated, upload.updated, 'upload has updated timestamp')
    assert.strictEqual(followUpUpload.created, upload.created, 'upload has inserted timestamp')
    assert.strictEqual(followUpUpload.type, upload.type, 'upload has same type')
    assert.strictEqual(followUpUpload.name, upload.name, 'upload has same name')

    const backups = await client.getBackups(upload._id)

    assert(backups, 'backups created')
    assert.strictEqual(backups.length, 3, 'upload has three backups')

    // Lists single upload
    const userUploads = await client.listUploads(user._id)
    assert(userUploads, 'user has uploads')
    assert.strictEqual(userUploads.length, 1, 'partial uploads result in a single upload for a user')
  })

  it('can rename uploads', async () => {
    const otherCid = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf311'
    const name = `Upload_${new Date().toISOString()}`

    const otherUploadCreated = await client.createUpload({
      user: user._id,
      contentCid: otherCid,
      sourceCid: otherCid,
      authKey: authKeys[0]._id,
      type,
      dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [`https://backup.cid/${new Date().toISOString()}`]
    })

    assert(otherUploadCreated, 'other upload created')

    const newName = 'renamed-name'
    const renamedUpload = await client.renameUpload(user._id, otherCid, newName)

    assert(renamedUpload, 'renamed upload')
    assert.strictEqual(renamedUpload.name, newName, 'upload has a new name')
  })

  it('can delete uploads', async () => {
    const otherCid = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf112'
    const name = `Upload_${new Date().toISOString()}`

    const { _id: uploadId } = await client.createUpload({
      user: user._id,
      contentCid: otherCid,
      sourceCid: otherCid,
      authKey: authKeys[0]._id,
      type,
      dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [`https://backup.cid/${new Date().toISOString()}`]
    })

    // Lists current user uploads
    const userUploads = await client.listUploads(user._id)

    // Delete previously created upload
    await client.deleteUpload(user._id, otherCid)

    // Should fail to delete again
    let error
    try {
      await client.deleteUpload(user._id, otherCid)
    } catch (err) {
      error = err
    }
    assert(error, 'should fail to delete upload again')

    const finalUserUploads = await client.listUploads(user._id)
    assert(finalUserUploads, 'user upload deleted')
    assert.strictEqual(finalUserUploads.length, userUploads.length - 1, 'user upload deleted')

    // Create the same upload will result in getting it "restored"
    const { _id: uploadIdRestored } = await client.createUpload({
      user: user._id,
      contentCid: otherCid,
      sourceCid: otherCid,
      authKey: authKeys[0]._id,
      type,
      dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [`https://backup.cid/${new Date().toISOString()}`]
    })

    assert.strictEqual(uploadId, uploadIdRestored)
  })

  it('creates a new upload for the same content when content uploaded by multiple users', async () => {
    // Create other user
    const name = 'test-other-name'
    const email = 'test-other@email.com'
    const issuer = `issuer${Math.random()}`
    const publicAddress = `public_address${Math.random()}`
    await client.upsertUser({
      name,
      email,
      issuer,
      publicAddress
    })

    // Get previously created user
    const otherUser = await client.getUser(issuer)

    // Create other user auth key
    const authKey = await client.createKey({
      name: 'test-key-name',
      secret: 'test-secret',
      user: otherUser._id
    })

    // Create upload with same cid as previous created, but with a different user
    const uploadWithSameCid = await client.createUpload({
      user: otherUser._id,
      contentCid: cid,
      sourceCid: cid,
      authKey: authKey._id,
      type,
      dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [`https://backup.cid/${new Date().toISOString()}`]
    })

    assert(uploadWithSameCid, 'upload created')
    assert(uploadWithSameCid._id, 'upload has id')
    assert.notStrictEqual(uploadWithSameCid._id, upload._id, 'a new upload was created for a new user')
  })

  it('can list user uploads with several options', async () => {
    const previousUserUploads = await client.listUploads(user._id)
    assert(previousUserUploads, 'user has uploads')

    const differentCid = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf355'
    const created = new Date().toISOString()
    await client.createUpload({
      user: user._id,
      contentCid: differentCid,
      sourceCid: differentCid,
      authKey: authKeys[0]._id,
      type,
      dagSize,
      name: 'ZZZZZZZZZ', // Name starting with Z for order testing
      pins: [initialPinData],
      backupUrls: [`https://backup.cid/${created}`],
      created
    })

    // Default sort {inserted_at, Desc}
    const userUploadsDefaultSort = await client.listUploads(user._id)
    assert.strictEqual(userUploadsDefaultSort.length, previousUserUploads.length + 1, 'user has the second upload')
    assert.strictEqual(userUploadsDefaultSort[0].cid, differentCid, 'last upload first')

    // Sort {inserted_at, Asc}
    const userUploadsAscAndInsertedSort = await client.listUploads(user._id, {
      sortOrder: 'Asc'
    })
    assert.notStrictEqual(userUploadsAscAndInsertedSort[0].cid, differentCid, 'first upload first')

    // Sort {name, Desc}
    const userUploadsByNameSort = await client.listUploads(user._id, {
      sortBy: 'Name'
    })
    assert.strictEqual(userUploadsByNameSort[0].cid, differentCid, 'last upload first')

    // Sort {name, Asc} with size
    const userUploadsAscAndByNameSort = await client.listUploads(user._id, {
      sortBy: 'Name',
      sortOrder: 'Asc',
      size: 1
    })
    assert.strictEqual(userUploadsAscAndByNameSort.length, 1, 'upload list with size')
    assert.notStrictEqual(userUploadsAscAndByNameSort[0].cid, differentCid, 'first upload first')

    // Filter with before second upload
    const userUploadsBeforeTheLatest = await client.listUploads(user._id, { before: created })
    assert.strictEqual(userUploadsBeforeTheLatest.length, previousUserUploads.length, 'list without the second upload')
  })
})
