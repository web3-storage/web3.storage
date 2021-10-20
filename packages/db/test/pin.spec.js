/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'
import { token } from './utils.js'

describe('pin', () => {
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
      region: 'region'
    }
  }
  let authKeys
  let upload

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

  // Setup upload
  before(async () => {
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

  it('can get upload pins', async () => {
    const pins = await client.getPins(cid)
    assert(pins, 'pins created')
    assert.strictEqual(pins.length, 1, 'upload has a single pin')
    assert(pins[0]._id, 'pin has id')
    assert(pins[0].created, 'pin has inserted timestamp')
    assert(pins[0].updated, 'pin has inserted timestamp')
    assert.strictEqual(pins[0].status, initialPinData.status, 'pin has correct state')
    assert.strictEqual(pins[0].peerId, initialPinData.location.peerId, 'pin has correct location peer id')
    assert.strictEqual(pins[0].peerName, initialPinData.location.peerName, 'pin has correct location peer name')
    assert.strictEqual(pins[0].region, initialPinData.location.region, 'pin has correct location peer region')
  })

  it('can update previously created pin', async () => {
    const newStatus = 'Pinned'
    const newName = 'peer_name_2'

    const pinsPreUpdated = await client.getPins(cid)
    assert.strictEqual(pinsPreUpdated[0].status, initialPinData.status, 'pin has correct state')
    assert.strictEqual(pinsPreUpdated[0].peerName, initialPinData.location.peerName, 'pin has correct location peer name')
    assert.notStrictEqual(pinsPreUpdated[0].status, newStatus, 'pin is pinning')
    assert.notStrictEqual(pinsPreUpdated[0].peerName, newName, 'pin has first name')

    // Update pin status to Pinned
    const updatedPin = await client.upsertPin(cid, {
      status: newStatus,
      location: {
        ...initialPinData.location,
        peerName: newName
      }
    })
    assert(updatedPin, 'pin updated')
    assert.strictEqual(updatedPin, pinsPreUpdated[0]._id, 'id of previous pin')

    const pinsAfterUpdated = await client.getPins(cid)
    assert.strictEqual(pinsAfterUpdated[0].status, newStatus, 'pin is pinned')
    assert.strictEqual(pinsAfterUpdated[0].peerName, newName, 'pin has second name')
    assert.notStrictEqual(pinsAfterUpdated[0].status, initialPinData.status, 'pin has correct state')
    assert.notStrictEqual(pinsAfterUpdated[0].peerName, initialPinData.location.peerName, 'pin has correct location peer name')
  })

  it('can insert a new pin for a cid', async () => {
    const pinsPreUpdated = await client.getPins(cid)
    const previousPinsNumber = pinsPreUpdated.length

    // Create pin for cid previously creaded by giving a new peer id
    const createdPin = await client.upsertPin(cid, {
      status: 'Pinning',
      location: {
        peerId: 'peer_id_2',
        peerName: 'peer_name_2',
        region: 'region'
      }
    })

    assert(createdPin, 'pin created')
    assert.notStrictEqual(createdPin, pinsPreUpdated[0]._id, 'id of previous pin not the same')

    const pinsAfterUpdated = await client.getPins(cid)
    assert.ok(pinsAfterUpdated.length > previousPinsNumber, 'cid has more pins')
  })
})
