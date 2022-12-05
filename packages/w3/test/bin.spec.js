/* eslint-env mocha */
import assert from 'assert'
import execa from 'execa'
import * as fs from 'fs'
import { config } from '../lib.js'

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
  it('fails with clear error if the path does not exist', () => {
    try {
      execa.sync('./bin.js', ['put', 'nonesuch'])
      assert.fail('Should exit with error code')
    } catch (err) {
      assert.match(err.stderr, /The path .+ does not exist/)
    }
  })
  it('fails with clear error if any path does not exist', () => {
    try {
      execa.sync('./bin.js', ['put', './bin.js', 'nonesuch'])
      assert.fail('Should exit with error code')
    } catch (err) {
      assert.match(err.stderr, /The path .+ does not exist/)
    }
  })
})

describe('w3 put-car', () => {
  it('offers help', () => {
    try {
      execa.sync('./bin.js', ['put-car'])
      assert.fail('Should exit with error code')
    } catch (err) {
      assert.match(err.stderr, /Insufficient arguments!/)
    }
  })
  it('fails with clear error if the path does not exist', () => {
    try {
      execa.sync('./bin.js', ['put-car', 'nonesuch'])
      assert.fail('Should exit with error code')
    } catch (err) {
      assert.match(err.stderr, /The path .+ does not exist/)
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

describe('w3 name export', () => {
  it('prints key to console', () => {
    let subprocess
    config.set('name.test-name-1', 'test-key-1')
    try {
      subprocess = execa.sync('./bin.js', ['name', 'export', 'test-name-1'])
    } catch (err) {
      assert.fail(err)
    } finally {
      // Make sure we always delete the name, as the config is not isolated for tests
      config.delete('name.test-name-1')
    }
    assert.equal(subprocess.stdout, 'test-key-1')
  })

  it('shows error if key not stored', () => {
    try {
      execa.sync('./bin.js', ['name', 'export', 'does-not-exist'])
      assert.fail('Should exit with error code')
    } catch (err) {
      assert.match(err.stderr, /missing signing key for the provided <keyId>/)
    }
  })
})

describe('w3 name import', () => {
  const keyFilePath = '.temp-test-w3-name.key'

  afterEach(() => {
    // Make sure we always delete our temporary test file
    const promise = new Promise((resolve) => {
      fs.unlink(keyFilePath, resolve)
    })
    return promise
  })

  it('parses the key and stores it under its name', () => {
    const keyValue = 'CAESQICBBrgzClDI8Fv7WIU2FxwsF4IGuVE6G1RlKcT2Lpvb9qEGc9AZomDJOzZyxGXNX2ncUerhDCleaEKy38lRVCY='
    const keyName = 'k51qzi5uqu5dmbvogdxx7277ggw2jjt8bczc3axrr335c58umwgeromid1niue'
    fs.writeFileSync(keyFilePath, keyValue, 'utf8')
    try {
      const subprocess = execa.sync('./bin.js', ['name', 'import', keyFilePath])
      assert.equal(subprocess.stdout, `Stored key for name: '${keyName}'.`)
      assert.equal(config.get(`name.${keyName}`), keyValue)
    } finally {
      config.delete(`name.${keyName}`)
    }
  })

  it('fails if specified file does not exist', () => {
    let subprocess
    try {
      subprocess = execa.sync('./bin.js', ['name', 'import', 'imaginary-file-path.key'])
      assert.fail('Should exit with error when specified key file does not exist.')
    } catch (err) {
      assert.match(subprocess.stderr, /Could not open specified key file/)
    }
  })

  it('fails if file contains invalid key', () => {
    const keyValue = 'abcd123'
    fs.writeFileSync(keyFilePath, keyValue, 'utf8')
    try {
      execa.sync('./bin.js', ['name', 'import', keyFilePath])
      assert.fail('Should exit with error when key file does not contain a valid key.')
    } catch (err) {
      assert.match(err.stderr, /SyntaxError: Unexpected end of data/)
    }
  })
})
