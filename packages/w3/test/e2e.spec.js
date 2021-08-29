/* eslint-env mocha */
import execa from 'execa'
import assert from 'assert'
import fs from 'fs'

const API = 'https://api-staging.web3.storage'
const TOKEN = process.env.STAGING_WEB3_TOKEN
if (!TOKEN) {
  throw new Error('Please set STAGING_WEB3_TOKEN=<your staging api token here> in env')
}
const authArgs = ['--api', API, '--token', TOKEN]
const fixturesPath = 'test/fixtures'
const fixturesCid = 'bafybeig2girrvm6wjis6xuqaqvoxhfejuk2bwv4bfzpjhlahsume26ufjy'

describe('w3 put <path>', () => {
  it('puts a dir', () => {
    const { stdout } = execa.sync('./bin.js', ['put', fixturesPath, ...authArgs])
    assert.match(stdout, new RegExp(fixturesCid))
  }).timeout(60000)

  it('puts a dir --no-wrap', () => {
    const { stdout } = execa.sync('./bin.js', ['put', fixturesPath, ...authArgs, '--no-wrap'])
    assert.match(stdout, /bafybeifpw7nrh374rzfcxpaw3bkp6fr7djmujg5wvib6ma7i7n76t3k53q/)
  }).timeout(60000)
})

describe('w3 put-car <path>', () => {
  it('puts a single CAR', () => {
    const { stdout } = execa.sync('./bin.js', ['put-car', '../client/test/fixtures/dir.car', ...authArgs])
    assert.match(stdout, /bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu/)
  }).timeout(60000)
})

// FIXME: was working but now getting a 500 server error!
describe('w3 get <cid>', () => {
  it('gets a dir by cid', () => {
    try {
      // should write ./<cid> to disk
      const { exitCode } = execa.sync('./bin.js', ['get', fixturesCid, ...authArgs])
      assert.strictEqual(exitCode, 0)
      // const actual = fs.statSync(fixturesCid)
      // const expected = fs.statSync(fixturesPath)
      // assert.deepStrictEqual(actual, expected)
    } finally {
      fs.rmSync(fixturesCid, { recursive: true, force: true })
    }
  }).timeout(60000)
})
