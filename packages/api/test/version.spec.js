/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import {
  VERSION,
  COMMITHASH,
  BRANCH,
  MAINTENANCE_MODE
} from './scripts/worker-globals.js'

describe('GET /version', () => {
  it('retrieves version', async () => {
    const res = await fetch(new URL('version/', endpoint))
    assert(res.ok)
    const { version, commit, branch, mode } = await res.json()
    assert.strictEqual(version, VERSION)
    assert.strictEqual(commit, COMMITHASH)
    assert.strictEqual(branch, BRANCH)
    assert.strictEqual(mode, MAINTENANCE_MODE)
  })
})
