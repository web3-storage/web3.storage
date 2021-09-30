/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import { VERSION, COMMITHASH, BRANCH, RELEASE } from './scripts/worker-globals.js'

describe('GET /version', () => {
  it('get pin and deal status', async () => {
    const res = await fetch(new URL('version', endpoint))
    assert(res)
    assert(res.ok, `${JSON.stringify(res)}`)
    const { release, version, commit, branch } = await res.json()
    assert.strictEqual(release, RELEASE)
    assert.strictEqual(version, VERSION)
    assert.strictEqual(commit, COMMITHASH)
    assert.strictEqual(branch, BRANCH)
  })
})
