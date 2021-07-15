/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'

const cid = 'bafkqaaa'

describe('CORS', () => {
  it('sets CORS headers', async () => {
    const res = await fetch(new URL(`car/${cid}`, endpoint))
    assert(res.ok)
    assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*')
  })

  it('sets CORS headers on 404', async () => {
    const res = await fetch(new URL('nope', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 404, 'Expected 404 on /nope')
    assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*')
  })

  it('sets CORS headers on server error', async () => {
    const res = await fetch(new URL('error', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 500, 'Expected 500 on /error')
    assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*')
  })
})
