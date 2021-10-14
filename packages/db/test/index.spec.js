/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'

describe('db', () => {
  it('can create postgres client', () => {
    const dbClient = new DBClient({
      endpoint: 'http://127.0.0.1:3000',
      token: 'super-secret-jwt-token-with-at-least-32-characters-long',
      postgres: true
    })

    assert(dbClient.client, 'postgres client created')
  })

  it('can create fauna client', () => {
    const dbClient = new DBClient({
      token: 'super-secret-jwt-token-with-at-least-32-characters-long'
    })

    assert(dbClient._client, 'fauna client created')
  })
})
