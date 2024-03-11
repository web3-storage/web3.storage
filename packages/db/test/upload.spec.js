/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index.js'
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
      ipfsPeerId: 'ipfs_peer_id',
      region: 'region'
    }
  }
  let authKeys
  let upload

  // Setup first user upload
  beforeEach(async () => {
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
    assert.strictEqual(upload.pins[0].peerId, initialPinData.location.ipfsPeerId, 'pin has added peerId')
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
    const { uploads: userUploads, count } = await client.listUploads(user._id, { page: 1 })
    assert(userUploads, 'user has uploads')
    assert.strictEqual(userUploads.length, 1, 'partial uploads result in a single upload returned for a user')
    assert.strictEqual(count, 1, 'partial uploads result in a single upload count for a user')
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
    const { uploads: userUploads } = await client.listUploads(user._id, { page: 1 })

    // Delete previously created upload
    await client.deleteUpload(user._id, otherCid)

    const { data: deletedUpload } = await client._client
      .from('upload')
      .select('*')
      .eq('id', uploadId)
      .single()
    assert.strictEqual(deletedUpload.updated_at, deletedUpload.deleted_at)

    // Should fail to delete again
    const wasDeletedAgain = await client.deleteUpload(user._id, otherCid)
    assert.strictEqual(wasDeletedAgain, undefined, 'should fail to delete upload again')

    const { uploads: finalUserUploads } = await client.listUploads(user._id, { page: 1 })
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

  it('lists user uploads with source cid', async () => {
    const contentCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
    const sourceCid = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'
    const created = new Date().toISOString()
    await client.createUpload({
      user: user._id,
      contentCid,
      sourceCid,
      authKey: authKeys[0]._id,
      type,
      dagSize,
      name: 'ZZZZZZZZZ', // Name starting with Z for order testing
      pins: [initialPinData],
      backupUrls: [`https://backup.cid/${created}`],
      created
    })

    // Default sort {inserted_at, Desc}
    const { uploads: userUploads } = await client.listUploads(user._id, { page: 1 })
    assert.ok(userUploads.find(upload => upload.cid === sourceCid))
  })

  it('lists user uploads with CAR links in parts', async () => {
    const contentCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
    const sourceCid = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'
    // note: `exampleCarParkUrl` and `exampleS3Url` are for same CAR. The s3 url is base32(multihash(car)) and the other is cid v1
    const exampleCarParkUrl = 'https://carpark-dev.web3.storage/bagbaiera6xcx7hiicm7sc523axbjf2otuu5nptt6brdzt4a5ulgn6qcfdwea/bagbaiera6xcx7hiicm7sc523axbjf2otuu5nptt6brdzt4a5ulgn6qcfdwea.car'
    const exampleS3Url = 'https://dotstorage-dev-0.s3.us-east-1.amazonaws.com/raw/bafybeiao32xtnrlibcekpw3vyfi5txgrmvvrua4pccx3xik33ll3qhko2q/2/ciqplrl7tuebgpzbo5nqlqus5hj2kowxzz7ayr4z6ao2ftg7ibcr3ca.car'
    const created = new Date().toISOString()
    const name = `rand-${Math.random().toString().slice(2)}`
    await client.createUpload({
      user: user._id,
      contentCid,
      sourceCid,
      authKey: authKeys[0]._id,
      type,
      dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [`https://backup.cid/${created}`, exampleCarParkUrl, exampleS3Url],
      created
    })

    // Default sort {inserted_at, Desc}
    const { uploads } = await client.listUploads(user._id, { page: 1 })
    assert.ok(uploads.length > 0)
    for (const upload of uploads) {
      // backupUrls raw is private
      assert.ok(!('backupUrls' in upload), 'upload does not have backupUrls property')
      assert.ok(Array.isArray(upload.parts), 'upload.parts is an array')
    }
    const namedUpload = uploads.find(u => u.name === name)
    assert.deepEqual(namedUpload.parts, [
      // this corresponds to `exampleCarParkUrl`
      'bagbaiera6xcx7hiicm7sc523axbjf2otuu5nptt6brdzt4a5ulgn6qcfdwea'
    ])
  })

  it('lists user uploads with CAR links in parts', async () => {
    const contentCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
    const sourceCid = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'
    const exampleCarParkUrl = 'https://carpark-dev.web3.storage/bagbaiera6xcx7hiicm7sc523axbjf2otuu5nptt6brdzt4a5ulgn6qcfdwea/bagbaiera6xcx7hiicm7sc523axbjf2otuu5nptt6brdzt4a5ulgn6qcfdwea.car'
    const exampleS3Url = 'https://dotstorage-dev-0.s3.us-east-1.amazonaws.com/raw/bafybeiao32xtnrlibcekpw3vyfi5txgrmvvrua4pccx3xik33ll3qhko2q/2/ciqplrl7tuebgpzbo5nqlqus5hj2kowxzz7ayr4z6ao2ftg7ibcr3ca.car'
    const created = new Date().toISOString()
    const name = `rand-${Math.random().toString().slice(2)}`
    await client.createUpload({
      user: user._id,
      contentCid,
      sourceCid,
      authKey: authKeys[0]._id,
      type,
      dagSize,
      name,
      pins: [initialPinData],
      backupUrls: [`https://backup.cid/${created}`, exampleCarParkUrl, exampleS3Url],
      created
    })

    // Default sort {inserted_at, Desc}
    const { uploads } = await client.listUploads(user._id, { page: 1 })
    assert.ok(uploads.length > 0)
    for (const upload of uploads) {
      // backupUrls raw is private
      assert.ok(!('backupUrls' in upload), 'upload does not have backupUrls property')
      assert.ok(Array.isArray(upload.parts), 'upload.parts is an array')
    }
    const namedUpload = uploads.find(u => u.name === name)
    assert.deepEqual(namedUpload.parts, [
      // this corresponds to `exampleCarParkUrl`
      'bagbaiera6xcx7hiicm7sc523axbjf2otuu5nptt6brdzt4a5ulgn6qcfdwea'
    ])
  })

  it('can list user uploads with several options', async () => {
    const { uploads: previousUserUploads, count: previousUserUploadCount } = await client.listUploads(user._id, { page: 1 })
    assert(previousUserUploads, 'user has uploads')
    assert(previousUserUploadCount > 0, 'user has counted uploads')

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
    const { uploads: userUploadsDefaultSort } = await client.listUploads(user._id, { page: 1 })
    assert.strictEqual(userUploadsDefaultSort.length, previousUserUploads.length + 1, 'user has the second upload')
    assert.strictEqual(userUploadsDefaultSort[0].cid, differentCid, 'last upload first')

    // Sort {inserted_at, Asc}
    const { uploads: userUploadsAscAndInsertedSort } = await client.listUploads(user._id, {
      page: 1,
      sortOrder: 'Asc'
    })
    assert.notStrictEqual(userUploadsAscAndInsertedSort[0].cid, differentCid, 'first upload first')

    // Sort {name, Desc}
    const { uploads: userUploadsByNameSort } = await client.listUploads(user._id, {
      page: 1,
      sortBy: 'Name'
    })
    assert.strictEqual(userUploadsByNameSort[0].cid, differentCid, 'last upload first')

    // Sort {name, Asc} with size and page
    const { uploads: userUploadsAscAndByNameSort } = await client.listUploads(user._id, {
      page: 1,
      sortBy: 'Name',
      sortOrder: 'Asc',
      size: 1
    })
    assert.strictEqual(userUploadsAscAndByNameSort.length, 1, 'upload list with size')
    assert.notStrictEqual(userUploadsAscAndByNameSort[0].cid, differentCid, 'first upload first')

    // Filter with before second upload
    const { uploads: userUploadsBeforeTheLatest } = await client.listUploads(user._id, { before: new Date(created) })
    assert.strictEqual(userUploadsBeforeTheLatest.length, previousUserUploads.length, 'list without the second upload')

    // paginate uploads
    const { uploads: paginatedUserUploads, count: paginatedUserUploadCount } = await client.listUploads(user._id, { page: 2, size: 1 })
    assert.strictEqual(paginatedUserUploads.length, 1, 'only returns the paginated uploads')
    assert.strictEqual(paginatedUserUploadCount, previousUserUploads.length + 1, 'only returns the paginated uploads')
  })
})
