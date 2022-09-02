/* eslint-env mocha */
import assert from 'assert'
import { StripeBillingService, StripeCustomersService } from '../src/utils/stripe.js'

describe('StripeBillingService', async function () {
  it('can savePaymentMethod', async function () {
    const customerId = `customer-${Math.random().toString().slice(2)}`
    const paymentMethodId = /** @type const */ (`pm_${Math.random().toString().slice(2)}`)
    const billing = StripeBillingService.create()
    await billing.savePaymentMethod(customerId, paymentMethodId)
  })
})

describe('StripeCustomersService', async function () {
  it('can getOrCreateForUser', async function () {
    const userIdToCustomerId = new Map()
    const userId1 = 'userId1'
    const customerId1 = 'customerId1'
    const customers1 = StripeCustomersService.create(
      createMockStripe(),
      async (userId) => {
        const c = userIdToCustomerId.get(userId)
        if (c) {
          return { id: c }
        }
        throw new Error('no customer found for user id')
      }
    )

    // it should return the customer id if already set
    userIdToCustomerId.set(userId1, customerId1)
    const customerForUser1 = await customers1.getOrCreateForUser({ id: userId1 })
    assert.equal(customerForUser1.id, customerId1, 'should have returned the customer id')
    userIdToCustomerId.delete(userId1)
  })
})

function createMockStripeCustomer () {
  return {
    id: `customer-${Math.random().toString().slice(2)}`
  }
}

/** @returns {import('../src/utils/stripe.js').StripeComForCustomersService} */
function createMockStripe () {
  return {
    customers: {
      // @ts-ignore
      create: async () => {
        const customer = createMockStripeCustomer()
        return customer
      }
    }
  }
}
