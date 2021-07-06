/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'

const cid = 'bafkqaaa'

describe('CORS', () => {
  it('sets CORS headers', async () => {
    const res = await fetch(new URL(`car/${cid}`, endpoint).toString())
    assert(res.ok)
    assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*')
  })
})
