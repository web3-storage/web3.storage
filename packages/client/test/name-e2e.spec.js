/* global describe, it */
import assert from 'assert'

/**
 * This test module does an end-to-end test of the w3name functionality via the proxy of
 * that package which we have for backwards compatibility. When we remove the proxy we
 * can remove this test.
 */

import * as Name from 'web3.storage/name'

describe('w3name backward compatibility proxy', () => {
  it('can publish and resolve name records', async function () {
    this.timeout(5 * 1000)
    // The `service` arg gets ignored by the proxy, but is required, as the function signatures
    // have remained the same to keep backwards compatibility
    const service = {}
    const tenMinutes = 1000 * 60 * 10
    const defaultValidity = () => new Date(Date.now() + tenMinutes).toISOString()
    const name = await Name.create()
    const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui' // dog
    const revision = await new Name.Revision(name, value, 0n, defaultValidity())
    await Name.publish(service, revision, name.key)
    // Resolve the record and check that it has the right value
    let latest = await Name.resolve(service, name)
    assert.equal(latest.value, value)
    // Update the record with a new value
    const nextValue = '/ipfs/bafybeic7zrcqvhanfwl4o7ei3565o55ovu7bnrqdocumj6pg6s6dfskpvy/olli-the-polite-cat.webp' // cat
    const nextRevision = new Name.Revision(name, nextValue, 1n, defaultValidity())
    await Name.publish(service, nextRevision, name.key)
    // Check that the name now resolves to the new value
    latest = await Name.resolve(service, name)
    assert.equal(latest.value, nextValue)
  })
})
