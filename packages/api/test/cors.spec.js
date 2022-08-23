/* eslint-env mocha */
import assert from 'assert'
import fetch from '@web-std/fetch'
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

  it('correctly responds to preflight request', async () => {
    const res = await fetch(new URL('version', endpoint), {
      method: 'OPTIONS',
      headers: {
        Origin: 'web3.storage',
        'Access-Control-Request-Method': 'whatever',
        'Access-Control-Request-Headers': 'whatever'
      }
    })
    assert(res.ok)
    assert.strictEqual(res.status, 204, 'Expected 204 status for OPTIONS request')
    assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'web3.storage')
    assert.strictEqual(res.headers.get('Access-Control-Allow-Methods'), 'GET,POST,PUT,DELETE,OPTIONS')
  })
})
