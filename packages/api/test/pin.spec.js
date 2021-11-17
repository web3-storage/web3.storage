/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import * as JWT from '../src/utils/jwt.js'
import { SALT } from './scripts/worker-globals.js'
import { JWT_ISSUER } from '../src/constants.js'

function getTestJWT (sub = 'test', name = 'test') {
  return JWT.sign({ sub, iss: JWT_ISSUER, iat: 1633957389872, name }, SALT)
}

describe.only('POST /pins', () => {
  it('should receive pin data containing cid', async () => {
    const name = 'car'
    // Create token
    const token = await getTestJWT()

    const res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Name': name
      },
      body: JSON.stringify({
        cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
      })
    })

    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const data = await res.json()
    assert(data, 'OK')
  })

  it('requires cid', async () => {
    const name = 'car'
    // Create token
    const token = await getTestJWT()

    const res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Name': name
      },
      body: JSON.stringify({})
    })

    assert(res, 'Server responded')
    assert(res.status, '400')
    const data = await res.json()
    const error = data.error
    assert(error.reason, 'Invalid request id:')
  })

  it('throws error if cid is invalid', async () => {
    const name = 'car'
    // Create token
    const token = await getTestJWT()

    const res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Name': name
      },
      body: JSON.stringify({
        cid: 'abc'
      })
    })

    assert(res, 'Server responded')
    assert(res.status, '400')
    const data = await res.json()
    assert(data.code, 'ERROR_INVALID_CID')
  })

  it('should receive pin data containing cid, name, origin, meta', async () => {
    const name = 'car'
    // Create token
    const token = await getTestJWT()

    const res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Name': name
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
    assert(data, 'OK')
  })

  it('validates name', async () => {
    const name = 'car'
    // Create token
    const token = await getTestJWT()

    const res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Name': name
      },
      body: JSON.stringify({
        cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
        name: 1
      })
    })

    assert(res, 'Server responded')
    assert(res.status, '400')
    const data = await res.json()
    const error = data.error
    assert(error.reason, 'INVALID_PIN_DATA')
    assert(error.details, 'Invalid name')
  })

  it('validates origins', async () => {
    const name = 'car'
    // Create token
    const token = await getTestJWT()

    const res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Name': name
      },
      body: JSON.stringify({
        cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
        origins: 1
      })
    })

    assert(res, 'Server responded')
    assert(res.status, '400')
    const data = await res.json()
    const error = data.error
    assert(error.reason, 'INVALID_PIN_DATA')
    assert(error.details, 'Invalid origins')
  })

  it('validates meta', async () => {
    const name = 'car'
    // Create token
    const token = await getTestJWT()

    let res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Name': name
      },
      body: JSON.stringify({
        cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
        meta: 1
      })
    })

    assert(res, 'Server responded')
    assert(res.status, '400')
    let data = await res.json()
    let error = data.error
    assert(error.reason, 'INVALID_PIN_DATA')
    assert(error.details, 'Invalid meta')

    res = await fetch(new URL('pins', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Name': name
      },
      body: JSON.stringify({
        cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
        meta: {
          app_id: 1
        }
      })
    })

    assert(res, 'Server responded')
    assert(res.status, '400')
    data = await res.json()
    error = data.error
    assert(error.reason, 'INVALID_PIN_DATA')
    assert(error.details, 'Invalid meta')
  })
})
