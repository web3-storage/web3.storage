/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index.js'
import { token } from './utils.js'

describe('billing db', () => {
  it('can upsertUserCustomer to associate user with a stripe customer and then getUserCustomer to read', async () => {
    const client = createDB()
    const customerId1 = 'cus_1'
    const customerId2 = 'cus_2'
    // we need a user to refer to
    const user1Upsertion = await client.upsertUser(createMockUser())
    const user1 = await client.getUser(user1Upsertion.issuer)
    const u1 = await client.upsertUserCustomer(user1._id, customerId1)
    const u2 = await client.upsertUserCustomer(user1._id, customerId2)
    assert.equal(u1._id, u2._id, 'consecutive upserts should result in same pk')

    const user1Customer = await client.getUserCustomer(user1._id)
    assert.equal(user1Customer.id, customerId2, 'should have updated the customer id')
  })
})

function createDB (dbToken = token) {
  /** @type {DBClient} */
  const client = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token: dbToken,
    postgres: true
  })
  return client
}

function createMockUser () {
  const randomness = Math.random.toString().slice(2)
  const name = `test-name-${randomness}`
  const email = `test-${randomness}@email.com`
  const issuer = `issuer-${randomness}`
  const publicAddress = `public_address_${randomness}`
  return { name, email, issuer, publicAddress }
}
