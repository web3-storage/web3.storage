/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'

import { createUser, createUserAuthKey, createUpload, defaultPinData, token } from './utils'

describe('pin-sync-request', () => {
  /** @type {DBClient} */
  const client = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token,
    postgres: true
  })

  const cids = [
    'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf350',
    'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf351',
    'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf352'
  ]
  let user
  let authKey
  const uploads = []

  // Setup testing user
  before(async () => {
    user = await createUser(client)
    authKey = await createUserAuthKey(client, user._id)
  })

  // Guarantee no pin sync requests exist
  before(async () => {
    const to = new Date().toISOString()
    const { data: pinSyncReqs } = await client.getPinSyncRequests({ to })

    await client.deletePinSyncRequests(pinSyncReqs.map(psr => psr._id))
  })

  // Setup two default uploads
  before(async () => {
    const upload0 = await createUpload(client, user._id, authKey, cids[0])
    const upload1 = await createUpload(client, user._id, authKey, cids[1])

    uploads.push(upload0)
    uploads.push(upload1)
  })

  it('created pin sync requests for the uploads', async () => {
    const to = new Date().toISOString()

    const { data: pinSyncReqs } = await client.getPinSyncRequests({ to })
    assert(pinSyncReqs, 'pin sync requests exist')

    // expect pin sync requests = added pins for each upload where status is not pinned
    const expectedPinSyncReqs = defaultPinData.filter(pd => pd.status !== 'Pinned').length * 2
    assert.strictEqual(pinSyncReqs.length, expectedPinSyncReqs, 'created pin sync requests for non pinned entries')
  })

  it('create multiple pin sync requests when upload has multiple pins', async () => {
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
        status: 'Pinning',
        location: {
          peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK7',
          peerName: 'web3-storage-sv16',
          region: 'region'
        }
      },
      {
        status: 'Pinned',
        location: {
          peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK8',
          peerName: 'web3-storage-sv17',
          region: 'region'
        }
      }
    ]

    await createUpload(client, user._id, authKey, cids[2], { pins })
    const to = new Date().toISOString()

    const { data: pinSyncReqs } = await client.getPinSyncRequests({ to })
    assert(pinSyncReqs, 'pin sync requests exist')

    // From the 2 setup uploads expected pins
    const previousExpectedPinSyncReqs = defaultPinData.filter(pd => pd.status !== 'Pinned').length * 2
    // Pins for the new upload
    const newPinSyncReqs = pins.filter(pd => pd.status !== 'Pinned').length
    assert.strictEqual(pinSyncReqs.length, newPinSyncReqs + previousExpectedPinSyncReqs, 'created pin sync requests for non pinned entries')
  })

  it('can update multiple pin status', async () => {
    const to = new Date().toISOString()
    const { data: pinSyncReqs } = await client.getPinSyncRequests({ to })

    // Assert Previous pin state
    pinSyncReqs.forEach(psr => {
      assert.strictEqual(psr.pin.status, 'Pinning', 'pin sync requests have Pinning state')
    })

    // Update all Pins to Pinned
    await client.upsertPins(pinSyncReqs.map(psr => ({
      id: psr.pin._id,
      status: 'Pinned',
      content_cid: psr.pin.contentCid,
      pin_location_id: psr.pin.location._id,
      updated_at: new Date().toISOString()
    })))

    const { data: pinSyncReqsAfterUpdate } = await client.getPinSyncRequests({ to })

    // Assert After pin state
    pinSyncReqsAfterUpdate.forEach(psr => {
      assert.strictEqual(psr.pin.status, 'Pinned', 'pin sync requests have Pinned state')
    })
  })

  it('can delete pin sync requests', async () => {
    const to = new Date().toISOString()
    const { data: pinSyncReqs } = await client.getPinSyncRequests({ to })

    await client.deletePinSyncRequests(pinSyncReqs.map(psr => psr._id))

    const { data: pinSyncReqsAfterUpdate } = await client.getPinSyncRequests({ to })
    assert(pinSyncReqsAfterUpdate, 'could get pin sync requests')
    assert.strictEqual(pinSyncReqsAfterUpdate.length, 0, 'all pin sync requests were deleted')
  })

  it('can create pin sync requests', async () => {
    const { data: pinSyncReqs } = await client.getPinSyncRequests({ to: new Date().toISOString() })
    const previousLength = pinSyncReqs.length

    // Get pins
    const pins0 = await client.getPins(cids[0])
    const pins1 = await client.getPins(cids[1])
    const pinIds = [
      ...pins0.map(p => p._id),
      ...pins1.map(p => p._id)
    ]

    // Create pin sync requests
    await client.createPinSyncRequests(pinIds)
    const { data: pinSyncReqsAfterUpdate } = await client.getPinSyncRequests({ to: new Date().toISOString() })

    assert(pinSyncReqsAfterUpdate, 'could get pin sync requests')
    assert.strictEqual(pinSyncReqsAfterUpdate.length, pinIds.length + previousLength, 'all pin sync requests were created')
  })
})
