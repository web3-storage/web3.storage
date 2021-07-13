/* eslint-env mocha */
import { Web3Storage } from 'web3.storage'
import * as assert from 'uvu/assert'

describe('interface', () => {
  it('has the expected API', () => {
    assert.equal(typeof Web3Storage, 'function')
    const client = new Web3Storage({ token: 'secret' })
    assert.ok(client instanceof Web3Storage)
    assert.equal(typeof client.put, 'function')
  })
})
