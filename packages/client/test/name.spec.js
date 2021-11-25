/* eslint-env mocha */
import { CID } from 'multiformats'
import * as assert from 'uvu/assert'
import { base36 } from 'multiformats/bases/base36'
// import { Web3Storage } from 'web3.storage'
import { identity } from 'multiformats/hashes/identity'
import * as Name from 'web3.storage/name'
import { keys } from 'libp2p-crypto'
import * as Digest from 'multiformats/hashes/digest'

const libp2pKeyCode = 0x72

describe.only('name', () => {
  // const { AUTH_TOKEN, API_PORT } = process.env
  // const token = AUTH_TOKEN || 'good'
  // const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('creates a new name', async () => {
    const name = await Name.create()
    /** @type CID */
    let cid
    assert.not.throws(() => { cid = CID.parse(name.toString(), base36) })
    assert.equal(cid.code, libp2pKeyCode)
    assert.equal(cid.multihash.code, identity.code)
    assert.not.throws(() => keys.unmarshalPublicKey(Digest.decode(cid.multihash.bytes).bytes))
  })
})
