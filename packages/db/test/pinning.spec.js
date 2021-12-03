/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'
import { createUpload, createUser, createUserAuthKey, token } from './utils.js'

const pinRequestTable = 'pa_pin_request'

/**
 *
 * @param {*} pinRequestOutput
 * @param {object} opt
 * @param {boolean} [opt.withContent]
 */
const assertCorrectPinRequestOutputTypes = (pinRequestOutput, { withContent = true } = {}) => {
  assert.ok(typeof pinRequestOutput._id === 'string', '_id should be a string')
  assert.ok(typeof pinRequestOutput.requestedCid === 'string', 'requestedCid should be a string')
  assert.ok(Array.isArray(pinRequestOutput.pins), 'pin should be an array')
  assert.ok(Date.parse(pinRequestOutput.created), 'created should be valid date string')
  assert.ok(Date.parse(pinRequestOutput.updated), 'updated should be valid date string')

  if (withContent) {
    assert.ok(typeof pinRequestOutput.contentCid === 'string', 'requestedCid should be a string')
  } else {
    assert.ifError(pinRequestOutput.contentCid)
  }
}

describe('Pin Request', () => {
  /** @type {DBClient & {_client}} */
  const client = (new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token
  }))
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

  // Create user and auth key
  before(async () => {
    user = await createUser(client)
    authKey = await createUserAuthKey(client, +user._id)
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
      const savedPinRequest = await client.getPAPinRequest(+aPinRequestOutput._id)
      assert.ok(savedPinRequest)
    })

    it('it returns the right object', async () => {
      assertCorrectPinRequestOutputTypes(aPinRequestOutput, { withContent: false })
      assert.strictEqual(aPinRequestOutput.requestedCid, cids[0], 'requestedCid is the one provided')
    })

    it('returns no pins if they do not exists', async () => {
      assert.strictEqual(aPinRequestOutput.pins.length, 0)
    })

    it('it returns the right object when it has content associated', async () => {
      assertCorrectPinRequestOutputTypes(aPinRequestOutputForExistingContent)
      assert.strictEqual(aPinRequestOutputForExistingContent.requestedCid, cids[1], 'requestedCid is the one provided')
    })

    it('returns a content cid if exists contentCid', async () => {
      assert.strictEqual(aPinRequestOutputForExistingContent.contentCid, cids[1])
    })

    it('returns pins if pins if content exists', async () => {
      // Only checking statuses for simplicity
      const statuses = aPinRequestOutputForExistingContent.pins
        .map((p) => p.status)
      assert.deepStrictEqual(statuses, [pins[0].status, pins[1].status])
    })
  })

  describe('Get Pin', () => {
    let savedPinRequest
    let savedPinRequestForExistingContent

    before(async () => {
      savedPinRequest = await client.getPAPinRequest(+aPinRequestOutput._id)
      savedPinRequestForExistingContent = await client.getPAPinRequest(+aPinRequestOutputForExistingContent._id)
    })

    it('it creates a Pin Request', async () => {
      assert.ok(savedPinRequest)
    })

    it('it returns the right object', async () => {
      assertCorrectPinRequestOutputTypes(savedPinRequest, { withContent: false })
      assert.strictEqual(savedPinRequest.requestedCid, cids[0], 'requestedCid is the one provided')
    })

    it('returns no pins if they do not exists', async () => {
      assert.strictEqual(savedPinRequest.pins.length, 0)
    })

    it('it returns the right object when it has content associated', async () => {
      assertCorrectPinRequestOutputTypes(savedPinRequestForExistingContent)
      assert.strictEqual(savedPinRequestForExistingContent.requestedCid, cids[1], 'rrequestedCid is the one provided')
    })

    it('returns a content cid if exists contentCid', async () => {
      assert.strictEqual(savedPinRequestForExistingContent.contentCid, cids[1])
    })

    it('returns pins if pins if content exists', async () => {
      // Only checking statuses for simplicity
      const statuses = savedPinRequestForExistingContent.pins
        .map((p) => p.status)
      assert.deepStrictEqual(statuses, [pins[0].status, pins[1].status])
    })

    it('throws if does not exists', async () => {
      assert.rejects(client.getPAPinRequest(1000))
    })
  })

  describe('Delete Pin', () => {
    it('throws if the request id does not exist', async () => {
      assert.rejects(client.deletePAPinRequest(1000, authKey))
    })

    it('throws if the auth key does not belong to the pin request', async () => {
      assert.rejects(client.deletePAPinRequest(+aPinRequestOutput._id, 'fakeAuth'))
    })

    it('returns the id of the deleted pin request', async () => {
      const pinRequest = await client.getPAPinRequest(+aPinRequestOutput._id)
      assert.ok(!pinRequest.deleted, 'is null')
      const deletedPinRequest = await client.deletePAPinRequest(+aPinRequestOutput._id, authKey)
      assert.ok(deletedPinRequest)
      assert.equal(deletedPinRequest._id, 3)
    })

    it('does not select pin request after deletion', async () => {
      assert.rejects(client.getPAPinRequest(+aPinRequestOutput._id))
    })

    it('cannot delete a pin request which is already deleted', async () => {
      assert.rejects(client.deletePAPinRequest(+aPinRequestOutput._id, authKey))
    })
  })
})
