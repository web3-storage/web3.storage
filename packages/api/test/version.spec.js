/* eslint-env mocha */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import git from 'git-rev-sync'
import fetch from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { MAINTENANCE_MODE, ENV } from './scripts/worker-globals.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))

describe('GET /version', () => {
  it('retrieves version', async () => {
    const res = await fetch(new URL('version/', endpoint))
    assert(res.ok)
    const { version, commit, branch, mode } = await res.json()
    assert.strictEqual(version, `web3-api@${pkg.version}-${ENV}+${git.short(__dirname)}`)
    assert.strictEqual(commit, git.long(__dirname))
    assert.strictEqual(branch, git.branch(__dirname))
    assert.strictEqual(mode, MAINTENANCE_MODE)
  })
})
