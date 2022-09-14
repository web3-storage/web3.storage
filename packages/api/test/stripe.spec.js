/* eslint-env mocha */
import assert from 'assert'
import { createMockUserCustomerService, CustomerNotFound, randomString } from '../src/utils/billing.js'
import { createMockStripeCustomer, createMockStripeForBilling, createMockStripeForCustomersService, createStripe, StripeBillingService, StripeCustomersService, StripeSubscriptionsService, testPriceForStorageFree, testPriceForStorageLite, testPriceForStoragePro } from '../src/utils/stripe.js'

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
    assert.ok(!(gotPaymentMethod instanceof Error), 'gotPaymentMethod did not return an error')
    assert.equal(gotPaymentMethod?.id, mockPaymentMethodId)
  })
  it('getPaymentMethod results in CustomerNotFound error if customer is deleted', async function () {
    const customerId = `customer-${Math.random().toString().slice(2)}`
    const mockStripe = createMockStripeForBilling({
      async retrieveCustomer (id) {
        return { deleted: true, id, object: 'customer' }
      }
    })
    const billing = StripeBillingService.create(mockStripe)
    const gotPaymentMethod = await billing.getPaymentMethod(customerId)
    assert.ok(gotPaymentMethod instanceof Error, 'getPaymentMethod returned an error')
    assert.equal(gotPaymentMethod.code, (new CustomerNotFound()).code)
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
    assert.ok(!(gotPaymentMethod instanceof Error), 'getPaymentMethod did not return an error')
    assert.ok(gotPaymentMethod, 'paymentMethod is truthy')
    assert.ok(gotPaymentMethod?.id.startsWith('pm_'), 'payment method id starts with pm_')
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
      createMockStripeForCustomersService(),
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

describe('StripeSubscriptionsService', async function () {
  it('can saveSubscription(a) twice then getSubscription against real stripe.com API', async function () {
    // ensure stripeSecretKey and use it to construct stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return this.skip()
    }
    assert.ok(stripeSecretKey, 'stripeSecretKey is required')
    const stripe = createStripe(stripeSecretKey)
    const customers = StripeCustomersService.create(stripe, createMockUserCustomerService())
    const user = { id: `user-${randomString()}` }
    const customer = await customers.getOrCreateForUser(user)
    const subscriptions = StripeSubscriptionsService.create(stripe)

    // change between tiers
    for (const price of [testPriceForStorageFree, testPriceForStorageFree, testPriceForStorageLite, testPriceForStoragePro]) {
      await subscriptions.saveSubscription(customer.id, {
        storage: {
          price
        }
      })
      const gotSavedSubscription2 = await subscriptions.getSubscription(customer.id)
      assert.ok(!(gotSavedSubscription2 instanceof Error), 'getSubscription did not return an error')
      assert.equal(gotSavedSubscription2.storage?.price, price, 'gotPaymentSettings.subscription.storage.price is same as desiredPaymentSettings.subscription.storage.price')
    }

    // unsubscribe to storage
    await subscriptions.saveSubscription(customer.id, {
      storage: null
    })
    const gotSavedSubscription3 = await subscriptions.getSubscription(customer.id)
    assert.ok(!(gotSavedSubscription3 instanceof Error), 'getSubscription did not return an error')
    assert.equal(gotSavedSubscription3.storage, null, 'gotPaymentSettings.subscription.storage.price is same as desiredPaymentSettings.subscription.storage.price')
  })
})
