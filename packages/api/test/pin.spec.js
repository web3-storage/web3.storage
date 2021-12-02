/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import * as JWT from '../src/utils/jwt.js'
import { SALT } from './scripts/worker-globals.js'
import { JWT_ISSUER } from '../src/constants.js'
import { ERROR_CODE, ERROR_STATUS, INVALID_CID, INVALID_META, INVALID_NAME, INVALID_ORIGINS, REQUIRED_CID } from '../src/pins.js'
import { PinningNotEnabledError } from '../src/errors'

function getTestJWT (sub = 'test', name = 'test') {
  return JWT.sign({ sub, iss: JWT_ISSUER, iat: 1633957389872, name }, SALT)
}

describe('POST /pins', () => {
  let token = null
  before(async () => {
    // Create token
    token = await getTestJWT('user-pinning-enabled')
  })

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
    const data = await res.json()
    assert.strictEqual(data, 'OK')
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
    const data = await res.json()
    assert.strictEqual(data, 'OK')
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

describe('GET /pins/:requestId', () => {
  let token = null
  before(async () => {
    // Create token
    token = await getTestJWT('user-pinning-enabled')
  })

  it('requires a string as requestId', async () => {
    const res = await fetch(new URL('pins/UniqueIdOfPinRequest', endpoint).toString(), {
      method: 'GET',
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

  it('requires requestId', async () => {
    const res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    assert(res, 'Server responded')
    assert(!res.ok)
  })

  it('error if user not authorised to pin', async () => {
    // User will have pinning disabled by default
    token = await getTestJWT()
    const res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    assert(!res.ok)
    assert.strictEqual(res.status, (new PinningNotEnabledError()).status)
  })
})

describe('GET /pins', () => {
  let token = null
  before(async () => {
    // Create token
    token = await getTestJWT()
  })

  it('requires requestId', async () => {
    const res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    assert(res, 'Server responded')
    assert(!res.ok)
  })
})

describe('DELETE /pins/:requestId', () => {
  let token = null
  before(async () => {
    // Create token
    token = await getTestJWT('user-pinning-enabled')
  })

  it('requires a string as requestId', async () => {
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
      }
    })

    assert(!res.ok)
    assert.strictEqual(res.status, (new PinningNotEnabledError()).status)
  })
})
