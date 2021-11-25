/* eslint-env mocha */
import { CID } from 'multiformats'
import * as assert from 'uvu/assert'
import { base36 } from 'multiformats/bases/base36'
import { Web3Storage } from 'web3.storage'
import { identity } from 'multiformats/hashes/identity'
import * as Name from 'web3.storage/name'
import { keys } from 'libp2p-crypto'
import * as Digest from 'multiformats/hashes/digest'
import * as uint8arrays from 'uint8arrays'

const libp2pKeyCode = 0x72

describe('name', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('creates a new name', async () => {
    const name = await Name.create()
    /** @type CID */
    let cid
    assert.not.throws(() => { cid = CID.parse(name.toString(), base36) })
    assert.equal(cid.code, libp2pKeyCode)
    assert.equal(cid.multihash.code, identity.code)
    assert.not.throws(() => keys.unmarshalPublicKey(Digest.decode(cid.multihash.bytes).bytes))

    assert.not.throws(() => { cid = CID.decode(name.bytes) })
    assert.equal(cid.code, libp2pKeyCode)
    assert.equal(cid.multihash.code, identity.code)
    assert.not.throws(() => keys.unmarshalPublicKey(Digest.decode(cid.multihash.bytes).bytes))
  })

  it('parses string to name', async () => {
    const nameStr = 'k51qzi5uqu5dl2hq2hm5m29sdq1lum0kb0lmyqsowicmrmxzxywwgxhy6ymrdv'
    let name
    assert.not.throws(() => { name = Name.parse(nameStr) })
    assert.equal(name.toString(), nameStr)
  })

  it('throws when parsing a non base36 encoded key', () => {
    // base58btc - cidv0 - dag-pb
    const invalidName = 'QmPFpDRC87jTdSYxjnEZUTjJuYF5yLRWxir3DzJ1XiVZ3t'
    assert.throws(() => Name.parse(invalidName), /Unable to decode multibase string/)
  })

  it('throws when parsing a non libp2p-key codec name', () => {
    // base36 - cidv1 - dag-pb
    const invalidName = 'k2jmtxx8tc9pv6b9sj5wm71mheawu849x2bzkjuecpwizjwjeufiadl6'
    assert.throws(() => Name.parse(invalidName), /invalid key/)
  })

  it('creates name from private key', async () => {
    const nameStr = 'k51qzi5uqu5dkgso0xihmnkn1sthxgs3nilzmofwy29jrplwdtk6sc14x9f2zv'
    const b64PrivKey = 'CAESQI8NcJgBK+9qfSBz/ZiXNuw4OJkUTn4jWZvd3Sj8W6GLq900cwz32d6ylbqBl81WRgM6QvSEXMwGlEODgEkXCes='
    const name = await Name.from(uint8arrays.fromString(b64PrivKey, 'base64pad'))
    assert.equal(name.toString(), nameStr)
  })

  it('creates and increments revision', async () => {
    const name = await Name.create()
    const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
    const revision = await Name.v0(name, value)

    assert.equal(revision.value, value)
    assert.equal(revision.sequence, 0n)
    assert.not.ok(isNaN(new Date(revision.validity).getTime()))

    const newValue = '/ipfs/QmPFpDRC87jTdSYxjnEZUTjJuYF5yLRWxir3DzJ1XiVZ3t'
    const newRevision = await Name.increment(revision, newValue)

    assert.equal(newRevision.value, newValue)
    assert.equal(newRevision.sequence, 1n)
    assert.not.ok(isNaN(new Date(newRevision.validity).getTime()))
  })

  it('throws when creating a revision with invalid arguments', async () => {
    const name = await Name.create()
    assert.throws(() => new Name.Revision(name, null, 0n, new Date().toISOString()), 'invalid value')
    assert.throws(() => new Name.Revision(name, '/ipfs/foo', NaN, new Date().toISOString()), 'invalid sequence')
    assert.throws(() => new Name.Revision(name, '/ipfs/foo', 0n, null), 'invalid validity')
  })

  it('serializes and deserializes a revision', async () => {
    const { Revision } = Name
    const name = await Name.create()
    const revision = await Name.v0(name, '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui')

    const encoded = Revision.encode(revision)
    assert.ok(encoded instanceof Uint8Array)

    const decoded = Revision.decode(encoded)
    assert.ok(decoded instanceof Revision)

    assert.equal(decoded.name.toString(), revision.name.toString())
    assert.equal(decoded.value, revision.value)
    assert.equal(decoded.sequence, revision.sequence)
    assert.equal(decoded.validity, revision.validity)
  })

  it('publishes and resolves', async () => {
    const client = new Web3Storage({ endpoint, token })

    const name = await Name.create()
    const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
    const revision = await Name.v0(name, value)

    await Name.publish(client, revision, name.key)
    const resolved = await Name.resolve(client, name)

    assert.equal(resolved.value, revision.value)

    const newValue = '/ipfs/QmPFpDRC87jTdSYxjnEZUTjJuYF5yLRWxir3DzJ1XiVZ3t'
    const newRevision = await Name.increment(revision, newValue)

    await Name.publish(client, newRevision, name.key)
    const newResolved = await Name.resolve(client, name)

    assert.equal(newResolved.value, newRevision.value)
  })

  it('handles application/json error response', async () => {
    const client = new Web3Storage({ endpoint, token })
    const name = 'json-error'

    try {
      await Name.resolve(client, name)
      assert.unreachable()
    } catch (err) {
      assert.equal(err.message, 'throw an error for the tests')
    }
  })

  it('handles text/plain error response', async () => {
    const client = new Web3Storage({ endpoint, token })
    const name = 'text-error'

    try {
      await Name.resolve(client, name)
      assert.unreachable()
    } catch (err) {
      assert.equal(err.message, 'unexpected status: 500')
    }
  })

  it('throws without token', async () => {
    const client = new Web3Storage({ endpoint })
    const name = await Name.create()
    const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
    const revision = await Name.v0(name, value)

    try {
      await Name.publish(client, revision, name.key)
      assert.unreachable()
    } catch (err) {
      assert.equal(err.message, 'missing token')
    }
  })
})
