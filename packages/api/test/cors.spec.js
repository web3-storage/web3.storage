/* eslint-env mocha, browser */
import assert from 'assert'

const endpoint = 'http://testing.web3.storage'
const cid = 'bafkqaaa'

describe('CORS', () => {
  it('sets CORS headers', async () => {
    const res = await fetch(new URL(`car/${cid}`, endpoint).toString())
    assert(res.ok)
    assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*')
  })
})
