/* eslint-env mocha */
import assertModule from 'assert'
import { magicTestModeIsEnabledFromEnv } from '../src/utils/env.js'

describe('env utils', () => {
  it('magicTestModeFromEnv parses env', async () => {
    testMagicTestModeFromEnv(magicTestModeIsEnabledFromEnv, assertModule)
  })
})

export function testMagicTestModeFromEnv (fn, assert) {
  assert.equal(fn({}), false)
  assert.equal(fn({
    NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED: ''
  }), false)
  assert.equal(fn({
    NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED: '1'
  }), true)
  assert.equal(fn({
    NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED: '0'
  }), false)
  assert.equal(fn({
    NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED: 'true'
  }), true)
  assert.equal(fn({
    NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED: 'false'
  }), false)
  assert.equal(fn({
    NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED: 'not-json-parseable'
  }), true)
}
