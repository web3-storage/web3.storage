/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import * as JWT from '../src/utils/jwt.js'
import { SALT } from './scripts/worker-globals.js'
import { JWT_ISSUER } from '../src/constants.js'

function getTestJWT (sub = 'test', name = 'test') {
  return JWT.sign({ sub, iss: JWT_ISSUER, iat: Date.now(), name }, SALT)
}

describe('GET /user/tokens', () => {
  it('retrieves user tokens', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens', endpoint).toString(), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const tokens = await res.json()
    assert(Array.isArray(tokens))
    tokens.forEach(t => {
      assert(t._id)
      assert(t.name)
      assert(t.secret)
      assert(t.created)
    })
  })
})

describe('POST /user/tokens', () => {
  it('creates a new token', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens', endpoint).toString(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'test' })
    })
    assert(res.ok)
    assert.strictEqual(res.status, 201)
    const { _id } = await res.json()
    assert(_id)
  })

  it('requires valid name', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens', endpoint).toString(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: null })
    })
    assert(!res.ok)
    const { message } = await res.json()
    assert.strictEqual(message, 'invalid name')
  })
})

describe('DELETE /user/tokens/:id', () => {
  it('removes a token', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens/xyz', endpoint).toString(), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert.strictEqual(res.status, 410)
    const { _id } = await res.json()
    assert(_id)
  })
})
