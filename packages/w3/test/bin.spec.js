/* eslint-env mocha */
import execa from 'execa'
import assert from 'assert'

describe('w3', () => {
  it('can be executed', async () => {
    try {
      execa.sync('./bin.js')
      assert.fail('Should exit with error code')
    } catch (err) {
      assert.match(err.stderr, /No command specified./)
    }
  })

  it('--version', () => {
    const { stdout } = execa.sync('./bin.js', ['--version'])
    assert.match(stdout, /w3, \d.\d.\d/)
  })
})

describe('w3 put', () => {
  it('offers help', () => {
    try {
      execa.sync('./bin.js', ['put'])
      assert.fail('Should exit with error code')
    } catch (err) {
      assert.match(err.stderr, /Insufficient arguments!/)
    }
  })
})

describe('w3 get', () => {
  it('offers help', () => {
    try {
      execa.sync('./bin.js', ['get'])
      assert.fail('Should exit with error code')
    } catch (err) {
      assert.match(err.stderr, /Insufficient arguments!/)
    }
  })
})
