/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'
import { PostgresClient } from '../postgres/client'
import { createUser, createUserAuthKey, token } from './utils.js'

const pinRequestTable = 'pa_pin_request'

describe('Pin Request', () => {
  /** @type {PostgresClient} */
  const client = new PostgresClient({
    endpoint: 'http://127.0.0.1:3000',
    token
  })
  let user
  let authKey
  /**
   * @type {import('../db-client-types').PAPinRequestUpsertInput}
   */
  let aPinRequestInput
  let aPinRequestOutput

  // Create user and auth key`
  before(async () => {
    user = await createUser(client)
    authKey = await createUserAuthKey(client, user._id)

    aPinRequestInput = {
      requestedCid: 'a_cid',
      authKey
    }
  })

  // Guarantee no Pin requests exist
  before(async () => {
    await client._client.from(pinRequestTable).delete()
    const { count } = await client._client.from(pinRequestTable).select('id', {
      count: 'exact'
    })
    assert.equal(count, 0)
    aPinRequestOutput = await client.createPAPinRequest(aPinRequestInput)
  })

  describe('Create Pin', () => {
    it('it creates a Pin Request', async () => {
      const savedPinRequest = await client.getPAPinRequest(aPinRequestOutput._id)
      assert.ok(savedPinRequest)
    })
  })

  it('it returns the right object', async () => {
    assert.ok(typeof aPinRequestOutput._id === 'string', '_id is of type string')
    assert.ifError(aPinRequestOutput.contentCid)
    assert.ok(typeof aPinRequestOutput.requestedCid === 'string', 'requestedCid is of type string')
    assert.ok(Date.parse(aPinRequestOutput.created), 'created is valid date string')
    assert.ok(Date.parse(aPinRequestOutput.updated), 'updated is valid date string')
  })
})
