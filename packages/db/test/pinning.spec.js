/* eslint-env mocha, browser */
import assert from 'assert'
import { normalizeCid } from '../../api/src/utils/normalize-cid'
import { DBClient } from '../index'
import { createUser, createUserAuthKey, token } from './utils.js'

const pinRequestTable = 'pa_pin_request'

/**
 *
 * @param {*} pinRequestOutput
 * @param {object} opt
 * @param {boolean} [opt.withContent]
 */
const assertCorrectPinRequestOutputTypes = (pinRequestOutput) => {
  assert.ok(typeof pinRequestOutput._id === 'string', '_id should be a string')
  assert.ok(typeof pinRequestOutput.requestedCid === 'string', 'requestedCid should be a string')
  assert.ok(Array.isArray(pinRequestOutput.pins), 'pin should be an array')
  assert.ok(Date.parse(pinRequestOutput.created), 'created should be valid date string')
  assert.ok(Date.parse(pinRequestOutput.updated), 'updated should be valid date string')
  assert.ok(typeof pinRequestOutput.contentCid === 'string', 'requestedCid should be a string')
}

describe.only('Pin Request', () => {
  /** @type {DBClient & {_client: import('@supabase/postgrest-js').PostgrestClient }} */
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

  const cids = [
    'QmdA5WkDNALetBn4iFeSepHjdLGJdxPBwZyY47ir1bZGAK',
    'QmNvTjdqEPjZVWCvRWsFJA1vK7TTw1g9JP6we1WBJTRADM'
  ]

  const normalizedCids = cids.map(cid => normalizeCid(cid))

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
    authKey = await createUserAuthKey(client, parseInt(user._id, 10))
  })

  // Guarantee no Pin requests exist and create the ones needed for our tests
  before(async () => {
    // Make sure we don't have pinRequest and content
    await client._client.from(pinRequestTable).delete()
    const { count: countR } = await client._client.from(pinRequestTable).select('id', {
      count: 'exact'
    })
    assert.strictEqual(countR, 0, 'There are still requests in the db')

    aPinRequestInput = {
      requestedCid: cids[0],
      contentCid: normalizedCids[0],
      pins,
      authKey
    }

    aPinRequestOutput = await client.createPAPinRequest(aPinRequestInput)
  })

  describe('Create Pin', () => {
    it('creates a Pin Request', async () => {
      const savedPinRequest = await client.getPAPinRequest(parseInt(aPinRequestOutput._id, 10))
      assert.ok(savedPinRequest)
      assert.strictEqual(savedPinRequest._id, aPinRequestOutput._id)
    })

    it('returns the right object', async () => {
      assertCorrectPinRequestOutputTypes(aPinRequestOutput)
      assert.strictEqual(aPinRequestOutput.requestedCid, cids[0], 'rrequestedCid is not the one provided')
      assert.strictEqual(aPinRequestOutput.authKey, authKey, 'auth key is not the one provided')
      assert.strictEqual(aPinRequestOutput.contentCid, normalizedCids[0], 'contentCid is not the one provided')
    })

    it('creates content and pins', async () => {
      const { count: countContent } = await client._client
        .from('content')
        .select('cid', {
          count: 'exact'
        })
        .match({
          cid: normalizedCids[0]
        })
      assert.strictEqual(countContent, 1)

      const { count: countPins } = await client._client
        .from('pin')
        .select('id', {
          count: 'exact'
        })
        .match({
          content_cid: normalizedCids[0]
        })
      assert.strictEqual(countPins, pins.length)
    })

    it('returns the right pins', async () => {
      // Only checking statuses for simplicity
      const statuses = aPinRequestOutput.pins
        .map((p) => p.status)
      assert.deepStrictEqual(statuses, [pins[0].status, pins[1].status])
    })
  })

  describe('Get Pin', () => {
    let savedPinRequest

    before(async () => {
      savedPinRequest = await client.getPAPinRequest(parseInt(aPinRequestOutput._id, 10))
    })

    it('gets a Pin Request, if it exists', async () => {
      assert.ok(savedPinRequest)
    })

    it('returns the right object', async () => {
      assertCorrectPinRequestOutputTypes(savedPinRequest)
      assert.strictEqual(savedPinRequest.requestedCid, cids[0], 'rrequestedCid is not the one provided')
      assert.strictEqual(savedPinRequest.authKey, authKey, 'auth key is not the one provided')
      assert.strictEqual(savedPinRequest.contentCid, normalizedCids[0], 'contentCid is not the one provided')
    })

    it('returns the right pins', async () => {
      // Only checking statuses for simplicity
      const statuses = savedPinRequest.pins
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
      assert.rejects(client.deletePAPinRequest(parseInt(aPinRequestOutput._id, 10), 'fakeAuth'))
    })

    it('returns the id of the deleted pin request', async () => {
      const aPinRequestOutputId = parseInt(aPinRequestOutput._id, 10)
      const pinRequest = await client.getPAPinRequest(aPinRequestOutputId)
      assert.ok(!pinRequest.deleted, 'is null')
      const deletedPinRequest = await client.deletePAPinRequest(aPinRequestOutputId, authKey)
      assert.ok(deletedPinRequest)
      assert.equal(deletedPinRequest._id, pinRequest._id)
    })

    it('does not select pin request after deletion', async () => {
      assert.rejects(client.getPAPinRequest(parseInt(aPinRequestOutput._id, 10)))
    })

    it('cannot delete a pin request which is already deleted', async () => {
      assert.rejects(client.deletePAPinRequest(parseInt(aPinRequestOutput._id, 10), authKey))
    })
  })
})
