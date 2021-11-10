/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'

import { createUser, createUserAuthKey, createUpload, token } from './utils'

describe('pin-request', () => {
  /** @type {DBClient} */
  const client = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token,
    postgres: true
  })

  const cids = [
    'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf350',
    'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf351'
  ]

  const pins1 = [
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
    }
  ]
  let user
  let authKey
  const uploads = []

  // Setup testing user
  before(async () => {
    user = await createUser(client)
    authKey = await createUserAuthKey(client, user._id)
  })

  // Guarantee no pin requests exist
  before(async () => {
    const pinReqs = await client.getPinRequests()
    await client.deletePinRequests(pinReqs.map(pr => pr._id))
  })

  // Setup two uploads: first with default one pin and second with two pins
  before(async () => {
    const upload0 = await createUpload(client, user._id, authKey, cids[0])
    const upload1 = await createUpload(client, user._id, authKey, cids[1], { pins: pins1 })
    uploads.push(upload0)
    uploads.push(upload1)
  })

  it('can get pin requests and delete them', async () => {
    const pinReqs = await client.getPinRequests()
    assert(pinReqs, 'pin sync requests exist')
    // There is only one pin request per upload/content
    assert(pinReqs.length, uploads.length, 'created pin requests for each upload')

    await client.deletePinRequests(pinReqs.map(pr => pr._id))

    const pinReqsAfterUpdate = await client.getPinRequests()
    assert(pinReqsAfterUpdate, 'can get pin requests after update')
    assert.strictEqual(pinReqsAfterUpdate.length, 0, 'all pin requests were deleted')
  })
})
