/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'
import { token } from './utils.js'

describe('db', () => {
  it('can create postgres client', () => {
    const dbClient = new DBClient({
      endpoint: 'http://127.0.0.1:3000',
      token,
      postgres: true
    })

    assert(dbClient._client, 'postgres client created')
    assert.strictEqual(dbClient._isPostgres, true, 'postgres running')
  })

  it('can create fauna client', () => {
    const dbClient = new DBClient({
      token
    })

    assert(dbClient._client, 'fauna client created')
    assert.notStrictEqual(dbClient._isPostgres, true, 'fauna running')
  })
})
