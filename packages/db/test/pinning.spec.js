/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'
import { PostgresClient } from '../postgres/client'
import { createUpload, createUser, createUserAuthKey, token } from './utils.js'

const pinRequestTable = 'pa_pin_request'

describe('Pin Request', () => {
  /** @type {PostgresClient} */
  const client = new PostgresClient({
    endpoint: 'http://127.0.0.1:3000',
    token
  })
  let user
  let authKey
  /**
   * @type {import('../db-client-types').PAPinRequestUpsertInput}
   */
  let aPinRequestInput

  /**
   * @type {import('../db-client-types').PAPinRequestUpsertOutput}
   */
  let aPinRequestOutput

  /**
   * @type {import('../db-client-types').PAPinRequestUpsertInput}
   */
  let aPinRequestInputForExistingContent

  /**
   * @type {import('../db-client-types').PAPinRequestUpsertOutput}
   */
  let aPinRequestOutputForExistingContent

  const cids = [
    'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf356',
    'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf358'
  ]

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
    }
  ]

  // Create user and auth key`
  before(async () => {
    user = await createUser(client)
    authKey = await createUserAuthKey(client, user._id)
  })

  // Guarantee no Pin requests exist and create the ones needed for our tests
  before(async () => {
    // Make sure we don't have pinRequest and content
    await client._client.from(pinRequestTable).delete()
    const { count: countR } = await client._client.from(pinRequestTable).select('id', {
      count: 'exact'
    })
    assert.strictEqual(countR, 0, 'There are still requests in the db')

    await createUpload(client, user._id, authKey, cids[1], { pins: pins })

    aPinRequestInput = {
      requestedCid: cids[0],
      authKey
    }

    aPinRequestInputForExistingContent = {
      requestedCid: cids[1],
      authKey
    }

    aPinRequestOutput = await client.createPAPinRequest(aPinRequestInput)
    aPinRequestOutputForExistingContent = await client.createPAPinRequest(aPinRequestInputForExistingContent)
  })

  describe('Create Pin', () => {
    it('it creates a Pin Request', async () => {
      const savedPinRequest = await client.getPAPinRequest(aPinRequestOutput._id)
      assert.ok(savedPinRequest)
    })
  })

  it('it returns the right object', async () => {
    assert.ok(typeof aPinRequestOutput._id === 'string', '_id should be a string')
    assert.ifError(aPinRequestOutput.contentCid)
    assert.strictEqual(aPinRequestOutput.requestedCid, cids[0], 'requestedCid should be a string')
    assert.ok(typeof aPinRequestOutput.requestedCid === 'string', 'requestedCid should be a string')
    assert.ok(Array.isArray(aPinRequestOutput.pins), 'pin should be an array')
    assert.ok(Date.parse(aPinRequestOutput.created), 'created should be valid date string')
    assert.ok(Date.parse(aPinRequestOutput.updated), 'updated should be valid date string')
  })

  it('returns no pins if they do not exists', async () => {
    assert.strictEqual(aPinRequestOutput.pins.length, 0)
  })

  it('returns a content cid if exists contentCid', async () => {
    assert.strictEqual(aPinRequestOutputForExistingContent.contentCid, cids[1])
  })

  it('returns pins if content exists', async () => {
    // Only checking statuses for simplicity
    const statuses = aPinRequestOutputForExistingContent.pins
      .map((p) => p.status)
    assert.deepStrictEqual(statuses, [pins[0].status, pins[1].status])
  })
})
