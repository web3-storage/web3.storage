/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import * as JWT from '../src/utils/jwt.js'
import { SALT } from './scripts/worker-globals.js'
import { JWT_ISSUER } from '../src/constants.js'
import { PinningNotEnabledError } from '../src/errors'
import { ERROR_CODE, ERROR_STATUS, getPinningAPIStatus, INVALID_CID, INVALID_META, INVALID_NAME, INVALID_ORIGINS, INVALID_REQUEST_ID, REQUIRED_CID } from '../src/pins.js'

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

function getTestJWT (sub = 'test', name = 'test') {
  return JWT.sign({ sub, iss: JWT_ISSUER, iat: 1633957389872, name }, SALT)
}

describe('Pinning APIs endpoints', () => {
  let token = null

  before(async () => {
    // Create token
    token = await getTestJWT('user-pinning-enabled')
  })

  describe('POST /pins', () => {
    it('should receive pin data containing cid', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
        })
      })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response ok')
    })

    it('requires cid', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
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
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
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
      // User will have pinning disabled by default
      token = await getTestJWT()
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
        })
      })
  
      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotEnabledError()).status)
    })
  })

  describe('GET /pins', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('user-pinning-enabled')
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

    it('error if user not authorised to pin', async () => {
      // User will have pinning disabled by default
      token = await getTestJWT()
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
        })
      })
      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotEnabledError()).status)
    })
  })

  describe('GET /pins/:requestId', () => {
    let token = null
    before(async () => {
    // Create token
      token = await getTestJWT('user-pinning-enabled')
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

    it('it returns not found if the request does not exists', async () => {
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

    it('it returns the pin request', async () => {
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

    it('it returns the pin request with pinned status', async () => {
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
      assert.strictEqual(data.status, 'pinned')
    })

    it('error if user not authorised to pin', async () => {
      // User will have pinning disabled by default
      token = await getTestJWT()
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
        })
      })
  
      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotEnabledError()).status)
    })
  })

  describe('POST /pins/:requestId', () => {
    let token = null
    before(async () => {
      // Create token
      token = await getTestJWT('user-pinning-enabled')
    })
  
    it('error if user not authorised to pin', async () => {
      token = await getTestJWT()
      const res = await fetch(new URL('pins/UniqueIdOfPinRequest', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
  
      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotEnabledError()).status)
    })
  })

  describe('DELETE /pins/:requestId', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('user-pinning-enabled')
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

    it('requires a requestId', async () => {
      const res = await fetch(new URL('pins/UniqueIdOfPinRequest', endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      assert(res, 'Server responded')
      assert(res.ok, 'Server response ok')
      const data = await res.json()
      assert.strictEqual(data, 'OK')
    })

    it('error if user not authorised to pin', async () => {
      // User will have pinning disabled by default
      token = await getTestJWT()
      const res = await fetch(new URL('pins/UniqueIdOfPinRequest', endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
        })
      })
      assert(!res.ok)
      assert.strictEqual(res.status, (new PinningNotEnabledError()).status)
    })
  })

  describe('getPinningAPIStatus', () => {
    it('should return "pinned" if it is pinned on at least one node', () => {
      /** @type {import('../../db/db-client-types.js').PinItemOutput[]} */
      const pins = [
        createPinWithStatus('Pinned'),
        createPinWithStatus('PinQueued'),
        createPinWithStatus('PinError')
      ]
      assert.strictEqual(getPinningAPIStatus(pins), 'pinned')
    })

    it('should return "queued" if there are no pins yet', () => {
      const pins = []
      assert.strictEqual(getPinningAPIStatus(pins), 'queued')
    })

    it('should return "queued" if at least 1 pin has it queued', () => {
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
        createPinWithStatus('Remote')
      ]
      assert.strictEqual(getPinningAPIStatus(pins), 'queued')
    })

    it('should return "failed" if pins have statuses other than Pinned, Pinning, PinQueued or Remote', () => {
      const pins = [
        createPinWithStatus('UnpinQueued'),
        createPinWithStatus('PinError')
      ]
      assert.strictEqual(getPinningAPIStatus(pins), 'failed')
    })
  })
})
