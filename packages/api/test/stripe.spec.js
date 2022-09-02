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
    const userId1 = 'userId1'
    const userId2 = 'userId2'
    const customerId1 = 'customerId1'

    const mockUserCustomerService = createMockUserCustomerService()
    const customers1 = StripeCustomersService.create(
      createMockStripe(),
      mockUserCustomerService
    )

    // it should return the customer id if already set
    mockUserCustomerService.userIdToCustomerId.set(userId1, customerId1)
    const customerForUser1 = await customers1.getOrCreateForUser({ id: userId1 })
    assert.equal(customerForUser1.id, customerId1, 'should have returned the customer id')
    mockUserCustomerService.userIdToCustomerId.delete(userId1)

    // it should create the customer if needed
    const customerForUser2 = await customers1.getOrCreateForUser({ id: userId2 })
    assert.equal(typeof customerForUser2.id, 'string', 'should have returned a customer id')

    // it should not create the customer if already set
    const customer2ForUser2 = await customers1.getOrCreateForUser({ id: userId2 })
    assert.equal(customer2ForUser2.id, customerForUser2.id, 'should return same customer for same userId2')
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

function createMockUserCustomerService () {
  const userIdToCustomerId = new Map()
  const getUserCustomer = async (userId) => {
    const c = userIdToCustomerId.get(userId)
    if (c) {
      return { id: c }
    }
    return null
  }
  const upsertUserCustomer = async (userId, customerId) => {
    userIdToCustomerId.set(userId, customerId)
  }
  return {
    userIdToCustomerId,
    getUserCustomer,
    upsertUserCustomer
  }
}
