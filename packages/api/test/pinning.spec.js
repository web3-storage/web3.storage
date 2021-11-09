/* global describe it fetch Blob FormData */
/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import * as JWT from '../src/utils/jwt.js'
import { SALT } from './scripts/worker-globals.js'
import { JWT_ISSUER } from '../src/constants.js'

function getTestJWT (sub = 'test', name = 'test') {
  return JWT.sign({ sub, iss: JWT_ISSUER, iat: 1633957389872, name }, SALT)
}

describe('POST /pin', () => {
  it('should pin a file by CID to the Cluster', async () => {
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
        cid: 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf355'
      })
    })

    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const data = await res.json()
    const { requestId, status, created, pin, delegates } = data

    assert.ok(typeof requestId === 'string', 'Server response payload has `requestId` property')
    assert.ok(typeof status === 'string', 'Server response payload has `requestId` property')
    assert.ok(typeof created === 'string', 'Server response payload has `created` property')
    assert.ok(typeof pin === 'object', 'Server response payload has `pin` property')
    assert.ok(Array.isArray(delegates), 'Server response payload has `delegates` property')
  })
})
