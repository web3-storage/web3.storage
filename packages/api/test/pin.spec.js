/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import { getTestJWT } from './scripts/helpers.js'
import {
  ERROR_CODE,
  ERROR_STATUS,
  getPinningAPIStatus,
  INVALID_CID,
  INVALID_META,
  INVALID_NAME,
  INVALID_ORIGINS,
  INVALID_REQUEST_ID,
  REQUIRED_CID,
  INVALID_LIMIT,
  INVALID_REPLACE
} from '../src/pins.js'

/**
 *
 * @param {string} status
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

describe('Pinning APIs endpoints', () => {
  let token = null

  before(async () => {
    token = await getTestJWT('test-upload', 'test-upload')
  })

  describe('GET /pins', () => {
    let baseUrl
    let token

    before(async () => {
      baseUrl = new URL('pins', endpoint).toString()
      token = await getTestJWT('test-upload', 'test-upload')
    })

    it('validates filter values', async () => {
      const opts = new URLSearchParams({
        limit: '3.14'
      })
      const url = `${baseUrl}?${opts}`
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
      const cids = `
bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4,
bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q,
bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfo,
`

      const url = `${baseUrl}?cid=${cids}`
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
      const url = `${baseUrl}`
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Serve response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 6)
    })

    it('filters pins on CID, for this user', async () => {
      const cids = `
bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm,
bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q,
bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4
`

      const url = `${baseUrl}?cid=${cids}`
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Serve response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 2)
    })

    it('filters case sensitive exact match on name', async () => {
      const opts = new URLSearchParams({
        name: 'ReportDoc.pdf'
      })
      const url = `${baseUrl}?${opts}`
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Serve response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
    })

    it('filters case insensitive partial match on name', async () => {
      const opts = new URLSearchParams({
        name: 'image',
        match: 'ipartial'
      })
      const url = `${baseUrl}?${opts}`
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Serve response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 3)
    })

    it('filters pins created before a date', async () => {
      const opts = new URLSearchParams({
        before: '2021-07-01T00:00:00.000000Z'
      })
      const url = `${baseUrl}?${opts}`
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Serve response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
    })

    it('filters pins created after a date', async () => {
      const opts = new URLSearchParams({
        after: '2021-07-15T00:00:00.000000Z'
      })
      const url = `${baseUrl}?${opts}`
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Serve response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
    })

    it('limits the number of pins returned for this user and includes the total', async () => {
      const opts = new URLSearchParams({
        limit: '3'
      })
      const url = `${baseUrl}?${opts}`
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Serve response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 6)
      assert.strictEqual(data.results.length, 3)
    })
  })

  describe('POST /pins', () => {
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
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid,
          name: 'PreciousData.pdf',
          origins: [
            '/ip4/203.0.113.142/tcp/4001/p2p/QmSourcePeerId',
            '/ip4/203.0.113.114/udp/4001/quic/p2p/QmSourcePeerId'
          ],
          meta: {
            app_id: '99986338-1113-4706-8302-4420da6158aa'
          }
        })
      })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response ok')
      const data = await res.json()
      assert.strictEqual(data.pin.cid, cid)
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
  })

  describe('GET /pins/:requestId', () => {
    let token = null
    before(async () => {
    // Create token
      token = await getTestJWT()
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
      const pinThatDoesNotExists = '100'
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

    it('returns the pin request', async () => {
      const requestId = 1
      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()

      assert(res, 'Server responded')
      assert(res.ok, 'Serve response is ok')
      assertCorrectPinResponse(data)
      assert.deepEqual(data.requestId, requestId)
      assert.deepEqual(data.status, 'queued')
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
      assert(res.ok, 'Serve response is ok')

      assertCorrectPinResponse(data)
      assert.strictEqual(data.requestId, requestId.toString())
      assert.strictEqual(data.pin.name, 'reportdoc.pdf')
    })
  })

  describe('getPinningAPIStatus', () => {
    it('should return pinned if at it is pinned in at least a node', () => {
      /** @type {import('../../db/db-client-types.js').PinItemOutput[]} */
      const pins = [
        createPinWithStatus('Pinned'),
        createPinWithStatus('PinQueued'),
        createPinWithStatus('PinError')
      ]
      assert.strictEqual(getPinningAPIStatus(pins), 'pinned')
    })

    it('should return queued if there are no pins yet', () => {
      const pins = []
      assert.strictEqual(getPinningAPIStatus(pins), 'queued')
    })

    it('should return "queued" at least 1 pin has it queued', () => {
      const pins = [
        createPinWithStatus('UnpinQueued'),
        createPinWithStatus('PinError'),
        createPinWithStatus('PinQueued')
      ]
      assert.strictEqual(getPinningAPIStatus(pins), 'queued')
    })

    it('should return "queued" at least 1 pin has remote status', () => {
      const pins = [
        createPinWithStatus('UnpinQueued'),
        createPinWithStatus('PinError'),
        createPinWithStatus('PinQueued')
      ]

      assert.strictEqual(getPinningAPIStatus(pins), 'queued')
    })

    it('should return failed pins have statuses other than Pinned, Pinning, PinQueued or Remote', () => {
      const pins = [
        createPinWithStatus('UnpinQueued'),
        createPinWithStatus('PinError')
      ]

      assert.strictEqual(getPinningAPIStatus(pins), 'failed')
    })
  })

  describe('DELETE /pins/:requestId', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('test-upload', 'test-upload')
    })

    it('fails to delete if there is no user token', async () => {
      const res = await fetch(new URL('pins/1', endpoint).toString(), {
        method: 'DELETE'
      })

      assert(res, 'Server responded')
      assert(!res.ok)
      assert.deepEqual(res.status, 401)
    })

    it('requires a number as string as requestId', async () => {
      const res = await fetch(new URL('pins/NotAValidId', endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
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

    it('returns the pin request id that has been deleted', async () => {
      const requestId = 1
      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert(res.ok, 'Server responded')
      assert.equal(res.status, 200)
      const { _id } = await res.json()
      assert.strictEqual(_id, requestId)
    })
  })

  describe('POST /pins/:requestId', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('test-upload', 'test-upload')
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

    it.skip('should not replace the same pin request', async () => {
      const res = await fetch(new URL('pins/3', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid: 'bafybeihgrtet4vowd4t4iqaspzclxajrwwsesur7zllkahrbhcymfh7kyi'
        })
      })

      assert(res, 'Server responded')
      assert(!res.ok)
      assert.equal(res.status, 400)
      const { error } = await res.json()
      assert.equal(error.details, INVALID_REPLACE)
    })
  })
})
