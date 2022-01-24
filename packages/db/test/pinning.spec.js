/* eslint-env mocha, browser */
import assert from 'assert'
import { normalizeCid } from '../../api/src/utils/normalize-cid'
import { DBClient } from '../index'
import { createUpload, createUser, createUserAuthKey, token } from './utils.js'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
/* global crypto */

const pinRequestTable = 'psa_pin_request'

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
const assertCorrectPinRequestOutputTypes = (pinRequestOutput) => {
  assert.ok(typeof pinRequestOutput._id === 'string', '_id should be a string')
  assert.ok(typeof pinRequestOutput.sourceCid === 'string', 'sourceCid should be a string')
  assert.ok(Array.isArray(pinRequestOutput.pins), 'pin should be an array')
  assert.ok(Date.parse(pinRequestOutput.created), 'created should be valid date string')
  assert.ok(Date.parse(pinRequestOutput.updated), 'updated should be valid date string')
  assert.ok(typeof pinRequestOutput.contentCid === 'string', 'contentCid should be a string')
}

describe('Pin Request', () => {
  /** @type {DBClient & {_client: import('@supabase/postgrest-js').PostgrestClient }} */
  const client = (new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token
  }))
  let user
  let authKey
  /**
   * @type {import('../db-client-types').PsaPinRequestUpsertInput}
   */
  let aPinRequestInput

  /**
   * @type {import('../db-client-types').PsaPinRequestUpsertOutput}
   */
  let aPinRequestOutput

  const cids = [
    'QmdA5WkDNALetBn4iFeSepHjdLGJdxPBwZyY47ir1bZGAK',
    'QmNvTjdqEPjZVWCvRWsFJA1vK7TTw1g9JP6we1WBJTRADM'
  ]

  const meta = { key: 'value' }

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
      sourceCid: cids[0],
      contentCid: normalizedCids[0],
      meta,
      pins,
      authKey
    }

    aPinRequestOutput = await client.createPsaPinRequest(aPinRequestInput)
  })

  describe('Create Pin', () => {
    it('creates a Pin Request', async () => {
      const savedPinRequest = await client.getPsaPinRequest(authKey, parseInt(aPinRequestOutput._id, 10))
      assert.ok(savedPinRequest)
      assert.strictEqual(savedPinRequest._id, aPinRequestOutput._id)
    })

    it('returns the right object', async () => {
      assertCorrectPinRequestOutputTypes(aPinRequestOutput)
      assert.deepStrictEqual(aPinRequestOutput.meta, meta, 'metadata is not the one provided')
      assert.strictEqual(aPinRequestOutput.sourceCid, cids[0], 'sourceCid is not the one provided')
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
      savedPinRequest = await client.getPsaPinRequest(authKey, parseInt(aPinRequestOutput._id, 10))
    })

    it('gets a Pin Request, if it exists', async () => {
      assert.ok(savedPinRequest)
    })

    it('returns the right object', async () => {
      assertCorrectPinRequestOutputTypes(savedPinRequest)
      assert.strictEqual(savedPinRequest.sourceCid, cids[0], 'sourceCid is not the one provided')
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
      assert.rejects(client.getPsaPinRequest(authKey, 1000))
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
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        }, {
          name: 'capybara',
          date: [2020, 1, 1],
          sourceCid: cidWithContent2,
          cid: normalizeCidWithContent2
        },
        {
          name: 'Camel',
          date: [2020, 2, 1],
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'Giant Panda Bear',
          date: [2020, 3, 1],
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'giant Schnoodle',
          date: [2020, 4, 1],
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'giant worm',
          date: [2020, 5, 1],
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'Zonkey Schnoodle',
          date: [2020, 6, 1],
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'Zorse',
          date: [2020, 7, 1],
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          date: [2020, 8, 1],
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: '',
          date: [2020, 9, 1],
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        },
        {
          name: 'Bear',
          date: [2020, 10, 1],
          sourceCid: cidWithContent1,
          cid: normalizeCidWithContent1
        }
      ]

      createdPinningRequests = await Promise.all(pinRequestsInputs.map(async (item) => {
        const sourceCid = item.sourceCid || await randomCid()
        const normalizedCid = item.cid || normalizeCid(sourceCid)

        return client.createPsaPinRequest({
          ...(item.name) && { name: item.name },
          authKey: authKeyPinList,
          sourceCid: sourceCid,
          contentCid: normalizedCid,
          pins
        })
      }))
    })

    it('limits the results to 10', async () => {
      const { results: prs } = await client.listPsaPinRequests(authKeyPinList)
      assert.strictEqual(prs.length, 10)
    })

    it('limits the results to the provided limit', async () => {
      const limit = 8
      const { results: prs } = await client.listPsaPinRequests(authKeyPinList, {
        limit
      })
      assert.strictEqual(prs.length, limit)
    })

    it('returns only requests for the provided token', async () => {
      const { results: prs } = await client.listPsaPinRequests('10')
      assert.strictEqual(prs.length, 0)
    })

    it('sorts by date', async () => {
      const { results: prs } = await client.listPsaPinRequests(authKeyPinList)

      const sorted = prs.reduce((n, item) => n !== null && item.created <= n.created && item)
      assert(sorted)
    })

    it('filters items by provided status', async () => {
      const { results: pins } = await client.listPsaPinRequests(authKeyPinList, {
        statuses: ['Pinning', 'PinError']
      })

      assert.strictEqual(pins.length, 1)
      assert.strictEqual(pins[0].name, 'capybara')
    })

    it('filters items by provided cid', async () => {
      const cids = [createdPinningRequests[1].sourceCid]
      const { results: prs } = await client.listPsaPinRequests(authKeyPinList, {
        cid: cids
      })

      assert.strictEqual(prs.length, 1)
      assert(prs.map(p => p.sourceCid).includes(cids[0]))
    })

    it('filters items by exact match by default', async () => {
      const name = 'capybara'
      const { results: prs } = await client.listPsaPinRequests(authKeyPinList, {
        name
      })

      assert.strictEqual(prs.length, 1)
      prs.forEach(pr => {
        assert.strictEqual(pr.name, name)
      })
    })

    it('filters items by iexact match', async () => {
      const name = 'camel'
      const { results: prs } = await client.listPsaPinRequests(authKeyPinList, {
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
      const { results: prs } = await client.listPsaPinRequests(authKeyPinList, {
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
      const { results: prs } = await client.listPsaPinRequests(authKeyPinList, {
        name,
        match: 'ipartial'
      })

      assert.strictEqual(prs.length, 3)
      prs.forEach(pr => {
        assert(pr.name.toLowerCase().includes(name.toLowerCase()))
      })
    })

    it('filters items created before a date', async () => {
      const { results: pins } = await client.listPsaPinRequests(authKeyPinList, {
        before: '2021-01-01T00:00:00.000000Z'
      })

      assert.strictEqual(pins.length, 0)
    })

    it('filters items created after a date', async () => {
      const { results: pins } = await client.listPsaPinRequests(authKeyPinList, {
        after: '2021-01-01T00:00:00.000000Z',
        limit: 20
      })

      assert.strictEqual(pins.length, 11)
    })
  })

  describe('Delete Pin', () => {
    it('throws if the request id does not exist', async () => {
      assert.rejects(client.deletePsaPinRequest(1000, authKey))
    })

    it('throws if the auth key does not belong to the pin request', async () => {
      assert.rejects(client.deletePsaPinRequest(parseInt(aPinRequestOutput._id, 10), 'fakeAuth'))
    })

    it('returns the id of the deleted pin request', async () => {
      const aPinRequestOutputId = parseInt(aPinRequestOutput._id, 10)
      const pinRequest = await client.getPsaPinRequest(authKey, aPinRequestOutputId)
      assert.ok(!pinRequest.deleted, 'is null')
      const deletedPinRequest = await client.deletePsaPinRequest(aPinRequestOutputId, authKey)
      assert.ok(deletedPinRequest)
      assert.equal(deletedPinRequest._id, pinRequest._id)
    })

    it('does not select pin request after deletion', async () => {
      assert.rejects(client.getPsaPinRequest(authKey, parseInt(aPinRequestOutput._id, 10)))
    })

    it('cannot delete a pin request which is already deleted', async () => {
      assert.rejects(client.deletePsaPinRequest(parseInt(aPinRequestOutput._id, 10), authKey))
    })
  })
})
