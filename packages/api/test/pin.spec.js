/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import { getTestJWT } from './scripts/helpers.js'
import {
  ERROR_CODE,
  ERROR_STATUS,
  getEffectivePinStatus,
  INVALID_CID,
  INVALID_META,
  INVALID_NAME,
  INVALID_ORIGINS,
  INVALID_REQUEST_ID,
  REQUIRED_CID,
  INVALID_LIMIT,
  INVALID_REPLACE
} from '../src/pins.js'
import { PinningNotAuthorisedError } from '../src/errors'

/**
 *
 * @param {import('../../db/postgres/pg-rest-api-types').definitions['pin']['status']} status
 * @returns {import('../../db/db-client-types.js').PinItemOutput}
 */
const createPinWithStatus = (status) => {
  const now = new Date().toISOString()
  return {
    _id: (Math.random() * 100).toString(),
    status: status,
    created: now,
    updated: now,
    peerId: (Math.random() * 100).toString(),
    peerName: 'name',
    region: 'region'
  }
}

/**
 *
 * @param {object} data
 */
const assertCorrectPinResponse = (data) => {
  assert.ok(typeof data.requestId === 'string', 'requestId should be a string')
  assert.doesNotThrow(() => parseInt(data.requestId, 10), 'requestId is a stringified number')
  assert.ok(typeof data.status === 'string', 'status should be a string')
  assert.ok(['queued', 'pinning', 'pinned', 'failed'].includes(data.status), 'it has a valid status')
  assert.ok(Date.parse(data.created), 'created should be valid date string')
  assert.ok(Array.isArray(data.delegates), 'delegates should be an array')

  if (data.info) {
    assert.ok(typeof data.info === 'object', 'info should be an object')
  }

  assert.ok(typeof data.pin === 'object', 'pin should be an object')
  assert.ok(typeof data.pin.cid === 'string', 'pin.cid should be an string')

  if (data.pin.name) {
    assert.ok(typeof data.pin.name === 'string', 'pin.name should be an string')
  }

  if (data.pin.origins) {
    assert.ok(Array.isArray(data.pin.origins), 'pin.origins should be an array')
  }

  if (data.pin.meta) {
    assert.ok(typeof data.pin.meta === 'object', 'pin.meta should be an object')
  }
}

/**
 *
 * @param {string} cid
 * @param {string} token
 * @return {Promise<import('../src/pins.js').PsaPinStatusResponse>}
 */
const createPinRequest = async (cid, token) => {
  return await (await fetch(new URL('pins', endpoint).toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ cid })
  })).json()
}

describe('Pinning APIs endpoints', () => {
  describe('GET /pins', () => {
    let baseUrl
    let token

    before(async () => {
      baseUrl = new URL('pins', endpoint).toString()
      token = await getTestJWT('test-pinning', 'test-pinning')
    })

    it('returns unauthorized if no token', async () => {
      const res = await fetch(new URL('pins/1', endpoint).toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      assert(res, 'Server responded')
      assert(!res.ok)
      assert.deepEqual(res.status, 401)
    })

    it('validates filter values', async () => {
      const opts = new URLSearchParams({
        limit: '3.14'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const error = await res.json()
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, INVALID_LIMIT)
    })

    it('validates CID values passed as filter', async () => {
      const cids = [
        'notAValidCID',
        'bafybeia45bscvzxngto555xsel4gwoclb5fxd7zpxige7rl3maoleznswu',
        'bafybeid46f7zggioxjm5p2ze2l6s6wbqvoo4gzbdzfjtdosthmfyxdign4'
      ]

      const url = new URL(`${baseUrl}?cid=${cids.join(',')}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert.strictEqual(res.status, ERROR_CODE)
      const error = await res.json()
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, INVALID_CID)
    })

    it('returns the pins for this user with default filter values', async () => {
      const res = await fetch(
        baseUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 6)
    })

    it('filters pins on CID, for this user', async () => {
      const cids = [
        'bafybeig7yvw6a4uhio4pmg5gahyd2xumowkfljdukad7pmdsv5uk5zcseu',
        'bafybeia45bscvzxngto555xsel4gwoclb5fxd7zpxige7rl3maoleznswu',
        'bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4' // Not exists
      ]

      const url = new URL(`${baseUrl}?cid=${cids.join(',')}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 2)
    })

    it('filters case sensitive exact match on name', async () => {
      const opts = new URLSearchParams({
        name: 'ReportDoc.pdf'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
    })

    it('filters case insensitive partial match on name', async () => {
      const opts = new URLSearchParams({
        name: 'image',
        match: 'ipartial'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 3)
    })

    it('filters pins created before a date', async () => {
      const opts = new URLSearchParams({
        before: '2021-07-01T00:00:00.000000Z'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
    })

    it('filters pins created after a date', async () => {
      const opts = new URLSearchParams({
        after: '2021-07-15T00:00:00.000000Z'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
    })

    it('limits the number of pins returned for this user and includes the total', async () => {
      const opts = new URLSearchParams({
        limit: '3'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 6)
      assert.strictEqual(data.results.length, 3)
    })

    it('error if user not authorised to pin', async () => {
      const notAuthorisedToken = await getTestJWT('test-upload', 'test-upload')
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${notAuthorisedToken}`,
          'Content-Type': 'application/json'
        }
      })
      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotAuthorisedError()).status)
    })
  })

  describe('POST /pins', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('test-pinning', 'test-pinning')
    })

    it('should receive pin data containing cid', async () => {
      const cid = 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cid })
      })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response ok')
      const data = await res.json()
      assert.strictEqual(data.pin.cid, cid)
    })

    it('requires cid', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const data = await res.json()
      const error = data.error
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, REQUIRED_CID)
    })

    it('throws error if cid is invalid', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid: 'abc'
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const data = await res.json()
      const error = data.error
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, INVALID_CID)
    })

    it('should receive pin data containing cid, name, origin, meta', async () => {
      const cid = 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
      const meta = { app_id: '99986338-1113-4706-8302-4420da6158aa' }
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid,
          name: 'PreciousData.pdf',
          origins: [
            '/ip6/2606:4700:60::6/tcp/4009/p2p/QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N',
            '/ip4/172.65.0.13/tcp/4009/p2p/QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx4N'
          ],
          meta
        })
      })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response ok')
      const data = await res.json()
      assert.strictEqual(data.pin.cid, cid)
      assert.deepStrictEqual(data.pin.meta, meta)
    })

    it('validates name', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
          name: 1
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const data = await res.json()
      const error = data.error
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, INVALID_NAME)
    })

    it('validates origins', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
          origins: 1
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const data = await res.json()
      const error = data.error
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, INVALID_ORIGINS)
    })

    it('validates meta', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
          meta: 1
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const data = await res.json()
      const error = data.error
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, INVALID_META)
    })

    it('validates meta values', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
          meta: {
            app_id: 1
          }
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const data = await res.json()
      const error = data.error
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, INVALID_META)
    })

    it('error if user not authorised to pin', async () => {
      const notAuthorisedToken = await getTestJWT()
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notAuthorisedToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
        })
      })

      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotAuthorisedError()).status)
    })
  })

  describe('GET /pins/:requestId', () => {
    let pinRequest
    let token = null

    before(async () => {
      token = await getTestJWT('test-pinning', 'test-pinning')
      const cid = 'bafybeihy6bymmfcdjdrkhaha2srphnhrewimtkdxdmcama2dpgvpyx4efu'
      pinRequest = await (await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cid })
      })).json()
    })

    it('returns unauthorized if no token', async () => {
      const res = await fetch(new URL('pins/1', endpoint).toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      assert(res, 'Server responded')
      assert(!res.ok)
      assert.deepEqual(res.status, 401)
    })

    it('requires a string as requestId', async () => {
      const res = await fetch(new URL('pins/NotAValidId', endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      assert(res, 'Server responded')
      assert(!res.ok, 'Server returns an error')
      const data = await res.json()
      const error = data.error
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, INVALID_REQUEST_ID)
    })

    it('returns not found if the request does not exists', async () => {
      const pinThatDoesNotExists = 100
      const res = await fetch(new URL(`pins/${pinThatDoesNotExists}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      assert(res, 'Server responded')
      assert.deepEqual(res.status, 404)
    })

    it('returns not found if the request does not belong to the user token', async () => {
      const wrongToken = await getTestJWT('test-pinning-2', 'test-pinning-2')
      const res = await fetch(new URL(`pins/${pinRequest.requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${wrongToken}` }
      })

      assert(res, 'Server responded')
      assert.deepEqual(res.status, 404)
    })

    it('returns the pin request', async () => {
      const res = await fetch(new URL(`pins/${pinRequest.requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      assertCorrectPinResponse(data)
      assert.deepEqual(data.requestId, pinRequest.requestId)
      assert.deepEqual(data.status, 'pinning')
    })

    it('returns the pin request with specified name', async () => {
      const requestId = 2

      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      assertCorrectPinResponse(data)
      assert.strictEqual(data.requestId, requestId.toString())
      assert.strictEqual(data.pin.name, 'reportdoc.pdf')
    })

    it('returns the pin request with specified metadata', async () => {
      const requestId = 2
      const meta = { app_id: '99986338-1113-4706-8302-4420da6158aa' }

      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      assertCorrectPinResponse(data)
      assert.strictEqual(data.requestId, requestId.toString())
      assert.deepStrictEqual(data.pin.meta, meta)
    })

    it('error if user not authorised to pin', async () => {
      const notAuthorisedToken = await getTestJWT()
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notAuthorisedToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
        })
      })

      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotAuthorisedError()).status)
    })
  })

  describe('getPinningAPIStatus', () => {
    it('returns "pinned" if it is pinned on at least one node', () => {
      /** @type {import('../../db/db-client-types.js').PinItemOutput[]} */
      const pins = [
        createPinWithStatus('Pinned'),
        createPinWithStatus('PinQueued'),
        createPinWithStatus('PinError')
      ]
      assert.strictEqual(getEffectivePinStatus(pins), 'pinned')
    })

    it('returns "queued" if there are no pins yet', () => {
      const pins = []
      assert.strictEqual(getEffectivePinStatus(pins), 'failed')
    })

    it('returns "queued" if at least 1 pin has it queued', () => {
      const pins = [
        createPinWithStatus('UnpinQueued'),
        createPinWithStatus('PinError'),
        createPinWithStatus('PinQueued')
      ]
      assert.strictEqual(getEffectivePinStatus(pins), 'queued')
    })

    it('returns "queued" at least 1 pin has remote status', () => {
      const pins = [
        createPinWithStatus('UnpinQueued'),
        createPinWithStatus('PinError'),
        createPinWithStatus('Remote')
      ]
      assert.strictEqual(getEffectivePinStatus(pins), 'queued')
    })

    it('returns "failed" if pins have statuses other than Pinned, Pinning, PinQueued or Remote', () => {
      const pins = [
        createPinWithStatus('UnpinQueued'),
        createPinWithStatus('PinError')
      ]
      assert.strictEqual(getEffectivePinStatus(pins), 'failed')
    })
  })

  describe('DELETE /pins/:requestId', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('test-pinning', 'test-pinning')
    })

    it('fails to delete if there is no user token', async () => {
      const res = await fetch(new URL('pins/1', endpoint).toString(), {
        method: 'DELETE'
      })

      assert(res, 'Server responded')
      assert(!res.ok)
      assert.deepEqual(res.status, 401)
    })

    it('requires a valid string as requestId', async () => {
      const res = await fetch(new URL('pins/NotAValidId', endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      assert(res, 'Server responded')
      assert(!res.ok, 'Server returns an error')
      const data = await res.json()
      const error = data.error
      assert.strictEqual(error.reason, ERROR_STATUS)
      assert.strictEqual(error.details, INVALID_REQUEST_ID)
    })

    it('returns not found if the request does not exists', async () => {
      const pinThatDoesNotExists = 100
      const res = await fetch(new URL(`pins/${pinThatDoesNotExists}`, endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert(res, 'Server responded')
      assert.deepEqual(res.status, 404)
    })

    it('deletes the pin request', async () => {
      const cid = 'bafybeifzequu4ial7i4jdw4gxabi5xyx2qeci2o4scc65s2st5o7fsynqu'
      const pinRequest = await createPinRequest(cid, token)

      const r = await fetch(new URL(`pins/${pinRequest.requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert(r.ok, 'It did not create the request in the first place')

      const resD = await fetch(new URL(`pins/${pinRequest.requestId}`, endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert.equal(resD.status, 202, 'Delete request was not successful')

      const res = await fetch(new URL(`pins/${pinRequest.requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert.equal(res.status, 404)
    })

    it('returns the pin request id that has been deleted', async () => {
      const requestId = 1
      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert(res.ok, 'Server responded')
      assert.equal(res.status, 202)
    })

    it('error if user not authorised to pin', async () => {
      const notAuthorisedToken = await getTestJWT()
      const res = await fetch(new URL('pins/1', endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${notAuthorisedToken}`,
          'Content-Type': 'application/json'
        }
      })
      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotAuthorisedError()).status)
    })
  })

  describe('POST /pins/:requestId', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('test-pinning', 'test-pinning')
    })

    it('should not replace a pin request that doesn\'t exist', async () => {
      const res = await fetch(new URL('pins/100', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
        })
      })

      assert(res, 'Server responded')
      assert.equal(res.status, 404)
      const { message } = await res.json()
      assert.equal(message, 'Not Found')
    })

    it('should delete the pin request and replace it', async () => {
      const cid = 'bafybeid3ka3b3f443kv2je3mfm4byk6qps3wipr7wzu5uli6tdo57crcke'
      const newCid = 'bafybeid4f2r3zpnkjqrglkng265ttqg6zbdr75dpbiwellvlpcxq7pggjy'

      // Creates pin Requests
      const pinRequest = await createPinRequest(cid, token)

      // It replaces it
      const resR = await fetch(new URL(`pins/${pinRequest.requestId}`, endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid: newCid
        })
      })

      assert(resR, 'Replace request did not respond')
      assert(resR.ok, 'Replace request was not successful')

      const resG = await fetch(new URL(`pins/${pinRequest.requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert(resG, 'Get request did not respond')
      assert.strictEqual(resG.status, 404, 'Pin request was not deleted')
    })

    it('should not replace the same pin request', async () => {
      const cid = 'bafybeieppxukl4i4acnjcdj2fueoa5oppuaciseggv2cvplj2iu6d7kx2e'
      const pinRequest = await createPinRequest(cid, token)
      const res = await fetch(new URL(`pins/${pinRequest.requestId}`, endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid
        })
      })

      assert(res, 'Server responded')
      assert(!res.ok)
      assert.equal(res.status, 400)
      const { error } = await res.json()
      assert.equal(error.details, INVALID_REPLACE)
    })

    it('error if user not authorised to pin', async () => {
      const notAuthorisedToken = await getTestJWT()
      const res = await fetch(new URL('pins/UniqueIdOfPinRequest', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notAuthorisedToken}`,
          'Content-Type': 'application/json'
        }
      })

      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotAuthorisedError()).status)
    })
  })
})
