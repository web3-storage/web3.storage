/* eslint-env mocha */
import assert from 'assert'
import { randomString } from '../src/utils/billing.js'
// eslint-disable-next-line no-unused-vars
import Stripe from 'stripe'
import { StripeBillingService, StripeCustomersService } from '../src/utils/stripe.js'

describe('StripeBillingService', async function () {
  it('can savePaymentMethod', async function () {
    const customerId = `customer-${Math.random().toString().slice(2)}`
    const paymentMethodId = /** @type const */ (`pm_${Math.random().toString().slice(2)}`)
    const billing = StripeBillingService.create(createMockStripeForBilling())
    await billing.savePaymentMethod(customerId, paymentMethodId)
  })
  it('can getPaymentMethod for a customer and it fetches from stripe', async function () {
    const customerId = `customer-${Math.random().toString().slice(2)}`
    const billing = StripeBillingService.create(createMockStripeForBilling())
    await billing.getPaymentMethod(customerId)
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

/** @returns {import('../src/utils/stripe.js').StripeComForBillingService} */
function createMockStripeForBilling () {
  const paymentMethods = {
    /**
     * @param {string} paymentMethodId
     * @param {Stripe.PaymentMethodAttachParams} customerId
     * @returns {Promise<Stripe.Response<Stripe.PaymentMethod>>}
     */
    attach: async (paymentMethodId, params) => {
      /** @type {Stripe.PaymentMethod} */
      const method = {
        ...createMockStripePaymentMethod(),
        id: paymentMethodId
      }
      /** @type {Stripe.Response<Stripe.PaymentMethod>} */
      const response = {
        // @ts-ignore
        lastResponse: undefined,
        ...method
      }
      return response
    }
  }
  /** @type {import('../src/utils/stripe.js').StripeComForBillingService['customers']} */
  const customers = {
    async retrieve (id, params) {
      const customer = createMockStripeCustomer()
      /** @type {Stripe.Response<Stripe.Customer>} */
      const response = {
        ...customer,
        // @ts-ignore
        lastResponse: undefined
      }
      return response
    }
  }
  /** @type {import('../src/utils/stripe.js').StripeComForBillingService['setupIntents']} */
  const setupIntents = {
    async create () {
      /** @type {Stripe.SetupIntent} */
      // @ts-ignore
      const setupIntent = {
        object: 'setup_intent',
        description: 'mock setup_intent'
      }
      /** @type {Stripe.Response<Stripe.SetupIntent>} */
      const response = {
        // @ts-ignore
        lastResponse: {},
        ...setupIntent
      }
      return response
    }
  }
  return { paymentMethods, customers, setupIntents }
}

/**
 * @returns {Stripe.PaymentMethod}
 */
function createMockStripePaymentMethod () {
  return {
    id: `pm_${randomString()}`,
    object: 'payment_method',
    billing_details: {
      name: [randomString(), randomString()].join(' '),
      address: {
        city: randomString(),
        country: randomString(),
        line1: randomString(),
        line2: randomString(),
        postal_code: randomString(),
        state: 'KS'
      },
      email: `${randomString()}@example.com`,
      phone: randomString()
    },
    created: Number(new Date()),
    livemode: false,
    type: 'card',
    metadata: {},
    customer: createMockStripeCustomer()
  }
}

/**
 * @returns {Stripe.Customer}
 */
function createMockStripeCustomer () {
  return {
    id: `customer-${randomString()}`,
    object: 'customer',
    balance: 0,
    created: Number(new Date()),
    email: `${randomString()}@example.com`,
    default_source: null,
    description: randomString(),
    livemode: false,
    metadata: {},
    // @ts-ignore
    invoice_settings: {}
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
