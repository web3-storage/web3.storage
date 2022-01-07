/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'
import { createUpload, createUser, createUserAuthKey, token } from './utils.js'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import { normalizeCid } from '../../api/src/utils/normalize-cid'
/* global crypto */

const pinRequestTable = 'pa_pin_request'

/**
 * @param {number} code
 * @returns {Promise<string>}
 */
async function randomCid (code = pb.code) {
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  const hash = await sha256.digest(bytes)
  return CID.create(1, code, hash).toString()
}

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
    assert.ok(typeof pinRequestOutput.contentCid === 'string', 'contentCid should be a string')
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

    await createUpload(client, user._id, authKey, cids[1], { pins: pins })

    aPinRequestInput = {
      requestedCid: cids[0],
      authKey
    }

    aPinRequestInputForExistingContent = {
      requestedCid: cids[1],
      cid: cids[1],
      authKey
    }

    aPinRequestOutput = await client.createPAPinRequest(aPinRequestInput)
    aPinRequestOutputForExistingContent = await client.createPAPinRequest(aPinRequestInputForExistingContent)
  })

  describe('Create Pin', () => {
    it('creates a Pin Request', async () => {
      const savedPinRequest = await client.getPAPinRequest(parseInt(aPinRequestOutput._id, 10))
      assert.ok(savedPinRequest)
    })

    it('returns the right object', async () => {
      assertCorrectPinRequestOutputTypes(aPinRequestOutput, { withContent: false })
      assert.strictEqual(aPinRequestOutput.requestedCid, cids[0], 'requestedCid is the one provided')
    })

    it('returns no pins if they do not exists', async () => {
      assert.strictEqual(aPinRequestOutput.pins.length, 0)
    })

    it('returns the right object when it has content associated', async () => {
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
      savedPinRequest = await client.getPAPinRequest(parseInt(aPinRequestOutput._id, 10))
      savedPinRequestForExistingContent = await client.getPAPinRequest(parseInt(aPinRequestOutputForExistingContent._id, 10))
    })

    it('creates a Pin Request', async () => {
      assert.ok(savedPinRequest)
    })

    it('returns the right object', async () => {
      assertCorrectPinRequestOutputTypes(savedPinRequest, { withContent: false })
      assert.strictEqual(savedPinRequest.requestedCid, cids[0], 'requestedCid is the one provided')
    })

    it('returns no pins if they do not exists', async () => {
      assert.strictEqual(savedPinRequest.pins.length, 0)
    })

    it('returns the right object when it has content associated', async () => {
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

  describe('Get Pins', () => {
    let pinRequestsInputs
    let userPinList
    let authKeyPinList
    let createdPinningRequests

    before(async () => {
    })

    before(async () => {
      userPinList = await createUser(client)
      authKeyPinList = await createUserAuthKey(client, parseInt(userPinList._id, 10))

      let pins = [
        {
          status: 'Pinned',
          location: {
            peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
            peerName: 'web3-storage-sv15',
            region: 'region'
          }
        },
        {
          status: 'Pinned',
          location: {
            peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK7',
            peerName: 'web3-storage-sv16',
            region: 'region'
          }
        }
      ]
      const cidWithContent1 = await randomCid()
      const normalizeCidWithContent1 = normalizeCid(cidWithContent1)
      await createUpload(client, parseInt(userPinList._id, 10), parseInt(authKeyPinList, 10), normalizeCidWithContent1, { pins: pins })

      pins = [
        {
          status: 'PinError',
          location: {
            peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
            peerName: 'web3-storage-sv15',
            region: 'region'
          }
        }
      ]
      const cidWithContent2 = await randomCid()
      const normalizeCidWithContent2 = normalizeCid(cidWithContent2)
      await createUpload(client, parseInt(userPinList._id, 10), parseInt(authKeyPinList, 10), normalizeCidWithContent2, { pins: pins })

      pinRequestsInputs = [
        {
          name: 'horse',
          date: [2020, 0, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'capybara',
          date: [2020, 1, 1],
          requestedCid: cidWithContent2,
          cid: normalizeCidWithContent2
        },
        {
          name: 'Camel',
          date: [2020, 2, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'Giant Panda Bear',
          date: [2020, 3, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'giant Schnoodle',
          date: [2020, 4, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'giant worm',
          date: [2020, 5, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'Zonkey Schnoodle',
          date: [2020, 6, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'Zorse',
          date: [2020, 7, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          date: [2020, 8, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: '',
          date: [2020, 9, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'Bear',
          date: [2020, 10, 1],
          requestedCid: cidWithContent1,
          cid: normalizeCidWithContent1
        }
      ]

      createdPinningRequests = await Promise.all(pinRequestsInputs.map(async (item) => {
        const requestedCid = item.requestedCid || await randomCid()
        const normalizedCid = item.cid || normalizeCid(requestedCid)

        return client.createPAPinRequest({
          ...(item.name) && { name: item.name },
          authKey: authKeyPinList,
          requestedCid: requestedCid,
          cid: normalizedCid
        })
      }))
    })

    it('limits the results to 10', async () => {
      const { results: prs } = await client.listPAPinRequests(authKeyPinList)
      assert.strictEqual(prs.length, 10)
    })

    it('limits the results to the provided limit', async () => {
      const limit = 8
      const { results: prs } = await client.listPAPinRequests(authKeyPinList, {
        limit
      })
      assert.strictEqual(prs.length, limit)
    })

    it('returns only requests for the provided token', async () => {
      const { results: prs } = await client.listPAPinRequests('10')
      assert.strictEqual(prs.length, 0)
    })

    it('sorts by date', async () => {
      const { results: prs } = await client.listPAPinRequests(authKeyPinList)

      const sorted = prs.reduce((n, item) => n !== null && item.created <= n.created && item)
      assert(sorted)
    })

    it('filters items by provided status', async () => {
      const { results: pins } = await client.listPAPinRequests(authKeyPinList, {
        status: ['pinning', 'failed']
      })

      assert.strictEqual(pins.length, 1)
      assert.strictEqual(pins[0].name, 'capybara')
    })

    it('filters items by provided cid', async () => {
      const cids = [createdPinningRequests[1].requestedCid]
      const { results: prs } = await client.listPAPinRequests(authKeyPinList, {
        cid: cids
      })

      assert.strictEqual(prs.length, 1)
      assert(prs.map(p => p.requestedCid).includes(cids[0]))
    })

    it('filters items by exact match by default', async () => {
      const name = 'capybara'
      const { results: prs } = await client.listPAPinRequests(authKeyPinList, {
        name
      })

      assert.strictEqual(prs.length, 1)
      prs.forEach(pr => {
        assert.strictEqual(pr.name, name)
      })
    })

    it('filters items by iexact match', async () => {
      const name = 'camel'
      const { results: prs } = await client.listPAPinRequests(authKeyPinList, {
        name,
        match: 'iexact'
      })

      assert.strictEqual(prs.length, 1)
      prs.forEach(pr => {
        assert.strictEqual(pr.name.toLowerCase(), name.toLowerCase())
      })
    })

    it('filters items by partial match', async () => {
      const name = 'giant'
      const { results: prs } = await client.listPAPinRequests(authKeyPinList, {
        name,
        match: 'partial'
      })

      assert.strictEqual(prs.length, 2)
      prs.forEach(pr => {
        assert(pr.name.includes(name))
      })
    })

    it('filters items by ipartial match', async () => {
      const name = 'giant'
      const { results: prs } = await client.listPAPinRequests(authKeyPinList, {
        name,
        match: 'ipartial'
      })

      assert.strictEqual(prs.length, 3)
      prs.forEach(pr => {
        assert(pr.name.toLowerCase().includes(name.toLowerCase()))
      })
    })

    it('filters items created before a date', async () => {
      const { results: pins } = await client.listPAPinRequests(authKeyPinList, {
        before: '2021-01-01T00:00:00.000000Z'
      })

      assert.strictEqual(pins.length, 0)
    })

    it('filters items created after a date', async () => {
      const { results: pins } = await client.listPAPinRequests(authKeyPinList, {
        after: '2021-01-01T00:00:00.000000Z',
        limit: 20
      })

      assert.strictEqual(pins.length, 11)
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
      assert.equal(deletedPinRequest._id, 3)
    })

    it('does not select pin request after deletion', async () => {
      assert.rejects(client.getPAPinRequest(parseInt(aPinRequestOutput._id, 10)))
    })

    it('cannot delete a pin request which is already deleted', async () => {
      assert.rejects(client.deletePAPinRequest(parseInt(aPinRequestOutput._id, 10), authKey))
    })
  })
})
