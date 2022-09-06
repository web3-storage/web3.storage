/* eslint-env mocha */
import assert from 'assert'
import { randomString } from '../src/utils/billing.js'
// eslint-disable-next-line no-unused-vars
import Stripe from 'stripe'
import { createStripe, StripeBillingService, StripeCustomersService } from '../src/utils/stripe.js'

describe('StripeBillingService', async function () {
  it('can savePaymentMethod', async function () {
    const customerId = `customer-${Math.random().toString().slice(2)}`
    const paymentMethodId = /** @type const */ (`pm_${Math.random().toString().slice(2)}`)
    let didCreateSetupIntent = false
    const billing = StripeBillingService.create(createMockStripeForBilling({
      retrieveCustomer: async () => createMockStripeCustomer(),
      onCreateSetupintent: () => { didCreateSetupIntent = true }
    }))
    await billing.savePaymentMethod(customerId, paymentMethodId)
    assert.equal(didCreateSetupIntent, true, 'created setupIntent using stripe api')
  })
  it('can getPaymentMethod for a customer and it fetches from stripe', async function () {
    const mockPaymentMethodId = `mock-paymentMethod-${randomString()}`
    const customerId = `customer-${Math.random().toString().slice(2)}`
    const mockStripe = createMockStripeForBilling({
      async retrieveCustomer () {
        return createMockStripeCustomer({
          defaultPaymentMethodId: mockPaymentMethodId
        })
      }
    })
    const billing = StripeBillingService.create(mockStripe)
    const gotPaymentMethod = await billing.getPaymentMethod(customerId)
    assert.equal(gotPaymentMethod.id, mockPaymentMethodId)
  })
})

describe('StripeCustomersService + StripeBillingService', () => {
  it('can savePaymentMethod and getPaymentMethod against real stripe.com api', async function () {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return this.skip()
    }
    assert.ok(stripeSecretKey, 'stripeSecretKey is required')
    const userCustomerService = createMockUserCustomerService()
    const customers = StripeCustomersService.create(createStripe(stripeSecretKey), userCustomerService)
    const billing = StripeBillingService.create(createStripe(stripeSecretKey))
    const user = { id: `user-${randomString()}` }
    const customer = await customers.getOrCreateForUser(user)
    const desiredPaymentMethodId = 'pm_card_visa'
    await billing.savePaymentMethod(customer.id, desiredPaymentMethodId)
    const gotPaymentMethod = await billing.getPaymentMethod(customer.id)
    assert.ok(gotPaymentMethod.id.startsWith('pm_'), 'payment method id starts with pm_')
    // it will have a 'card' property same as stripe
    assert.ok('card' in gotPaymentMethod, 'payment method has card property')
    const card = gotPaymentMethod.card
    assert.ok(typeof card === 'object', 'card is an object')
    assert.equal(card.brand, 'visa', 'card.brand is visa')
    assert.equal(card.country, 'US', 'card.country is US')
    assert.equal(typeof card.exp_month, 'number', 'card.exp_month is a number')
    assert.equal(card.funding, 'credit', 'card.funding is credit')
    assert.equal(card.last4, '4242', 'card.last4 is 4242')
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

/**
 * @param {object} [options]
 * @param {(id: string) => Promise<undefined|Stripe.Customer>} [options.retrieveCustomer]
 * @param {() => void} [options.onCreateSetupintent]
 * @returns {import('../src/utils/stripe.js').StripeComForBillingService}
 */
function createMockStripeForBilling (options = {}) {
  const retrieveCustomer = options.retrieveCustomer || async function (id) {
    throw new Error(`no customer found with id=${id}`)
  }
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
      const customer = await retrieveCustomer(id)
      /** @type {Stripe.Response<Stripe.Customer>} */
      const response = {
        ...customer,
        // @ts-ignore
        lastResponse: undefined
      }
      return response
    },
    async update (id, params) {
      /** @type {Stripe.Response<Stripe.Customer>} */
      const updatedCustomer = {
        // @ts-ignore
        lastResponse: undefined,
        ...createMockStripeCustomer(),
        params
      }
      return updatedCustomer
    }
  }
  /** @type {import('../src/utils/stripe.js').StripeComForBillingService['setupIntents']} */
  const setupIntents = {
    async create (params) {
      /** @type {Stripe.SetupIntent} */
      // @ts-ignore
      const setupIntent = {
        object: 'setup_intent',
        description: 'mock setup_intent',
        status: 'succeeded',
        payment_method: params.payment_method
      }
      options?.onCreateSetupintent?.()
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
 * @param {object} [options]
 * @param {string} [options.defaultPaymentMethodId]
 * @returns {Stripe.Customer}
 */
function createMockStripeCustomer (options = {}) {
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
    invoice_settings: {
      ...(options.defaultPaymentMethodId
        ? { default_payment_method: options.defaultPaymentMethodId }
        : {}
      )
    }
  }
}

/**
 * @returns {import('../src/utils/stripe.js').UserCustomerService & { userIdToCustomerId: Map<string,string> }}
 */
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
