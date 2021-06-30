import { FilecoinStorage } from 'web3.storage'
import * as assert from 'uvu/assert'

describe('interface', () => {
  it('has the expected API', () => {
    assert.equal(typeof FilecoinStorage, 'function')
    const client = new FilecoinStorage({ token: 'secret' })
    assert.ok(client instanceof FilecoinStorage)
    assert.equal(typeof client.store, 'function')
  })
})
