/* eslint-env mocha */
import assert from 'assert'
import { createMockAgreementService, createMockUserCustomerService, CustomerNotFound, randomString, storagePriceNames } from '../src/utils/billing.js'
import { createMockStripeCustomer, createMockStripeForBilling, createMockStripeForCustomersService, createMockStripeForSubscriptions, createMockStripeSubscription, createStripe, createStripeBillingContext, createStripeStorageEnvVar, createStripeStoragePricesFromEnv, stagingStripePrices, StripeBillingService, StripeCustomersService, StripeSubscriptionsService } from '../src/utils/stripe.js'
import sinon from 'sinon'

/**
 * @typedef {import('../src/utils/billing-types').StoragePriceName} StoragePriceName
 */

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
  it('getContact against bad customer id returns CustomerNotFound error', async function () {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return this.skip()
    }
    assert.ok(stripeSecretKey, 'stripeSecretKey is required')
    const customers = StripeCustomersService.create(
      createStripe(stripeSecretKey),
      createMockUserCustomerService()
    )
    const fakeCustomerId = 'fake-customer-id'
    const contact = await customers.getContact(fakeCustomerId)
    assert.ok(contact instanceof CustomerNotFound, 'getContact returns CustomerNotFound error')
  })
  it('updateContact against bad customer id returns CustomerNotFound error', async function () {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return this.skip()
    }
    assert.ok(stripeSecretKey, 'stripeSecretKey is required')
    const customers = StripeCustomersService.create(
      createStripe(stripeSecretKey),
      createMockUserCustomerService()
    )
    const fakeCustomerId = 'fake-customer-id'
    const contact2 = {
      name: 'contact 2',
      email: 'contact2@example.com'
    }
    const contact = await customers.updateContact(fakeCustomerId, contact2)
    assert.ok(contact instanceof CustomerNotFound, 'getContact returns CustomerNotFound error')
  })
  it('can updateContact then getContact', async function () {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return this.skip()
    }
    assert.ok(stripeSecretKey, 'stripeSecretKey is required')
    const customers = StripeCustomersService.create(
      createStripe(stripeSecretKey),
      createMockUserCustomerService()
    )
    const user = { id: `user-${randomString()}` }
    const customer = await customers.getOrCreateForUser(user)

    // update contact
    const contactUpdate2 = {
      name: 'contact 2',
      email: 'contact2@example.com'
    }
    await customers.updateContact(customer.id, contactUpdate2)
    const contact2 = await customers.getContact(customer.id)
    assert.deepEqual(contact2, contactUpdate2, 'getContact returns same contact as the udpate')
  })
  it('updateContact calls stripe.customers.update', async function () {
    const mockUserCustomerService = createMockUserCustomerService()
    const mockStripe = createMockStripeForCustomersService()
    const stripeCustomersUpdateSpy = sinon.spy(mockStripe.customers, 'update')
    const customers = StripeCustomersService.create(
      mockStripe,
      mockUserCustomerService
    )
    const user = { id: `user-${randomString()}` }
    const customer = await customers.getOrCreateForUser(user)
    const contactUpdate2 = {
      name: 'contact 2',
      email: 'contact2@example.com'
    }
    await customers.updateContact(customer.id, contactUpdate2)
    assert.equal(stripeCustomersUpdateSpy.callCount, 1)
    assert.equal(stripeCustomersUpdateSpy.getCalls()[0]?.args[0], customer.id, 'stripe.customers.update was called with correct customer id')
    assert.deepEqual(stripeCustomersUpdateSpy.getCalls()[0]?.args[1], contactUpdate2, 'stripe.customers.update was called with correct contact info')
  })
})

describe('StripeSubscriptionsService', async function () {
  it('can saveSubscription between prices using real stripe.com API', async function () {
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
    const prices = stagingStripePrices
    const subscriptions = StripeSubscriptionsService.create(stripe, prices)

    // change between tiers
    const priceSequence = [
      storagePriceNames.free,
      storagePriceNames.pro,
      storagePriceNames.pro,
      storagePriceNames.lite,
      storagePriceNames.free
    ]
    for (const price of priceSequence) {
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
  it('saveSubscription will convert StoragePriceName to appropriate stripe price id', async function () {
    const createdCalls = []
    const prices = stagingStripePrices
    const subscriptions = StripeSubscriptionsService.create(
      {
        ...createMockStripeForSubscriptions({
          onSubscriptionCreate (params) {
            createdCalls.push(params)
          },
          async retrieveCustomer (customerId) {
            return {
              ...createMockStripeCustomer(),
              subscriptions: {
                data: [],
                object: 'list',
                has_more: false,
                url: ''
              },
              id: customerId
            }
          }
        })
      },
      prices
    )
    const desiredPriceName = storagePriceNames.lite
    // save a subscription using the StoragePriceName
    const saved = await subscriptions.saveSubscription('customerId', {
      storage: {
        price: desiredPriceName
      }
    })
    assert.ok(!(saved instanceof Error), 'saveSubscription did not return an error')
    // expect stripe to have been called with a stripe price id, not StoragePriceName
    assert.equal(createdCalls.length, 1, 'should have called createSubscription once')
    assert.notEqual(createdCalls[0].items[0].price, desiredPriceName, 'should not have invoked stripe.com api with StripePriceName, it should be a stripe.com price id')
    assert.equal(createdCalls[0].items[0].price, prices.nameToPrice(desiredPriceName), 'should not have invoked stripe.com api with StripePriceName, it should be a stripe.com price id')
  })
  it('getSubscription will convert stripe price.id to StoragePriceName', async function () {
    const createdCalls = []
    const prices = stagingStripePrices
    const customerId = 'customer-id'
    const simulatedStoragePriceName = storagePriceNames.lite
    const subscriptions = StripeSubscriptionsService.create(
      {
        ...createMockStripeForSubscriptions({
          onSubscriptionCreate (params) {
            createdCalls.push(params)
          },
          async retrieveCustomer (customerId) {
            return {
              ...createMockStripeCustomer(),
              subscriptions: {
                data: [
                  createMockStripeSubscription({
                    items: [
                      {
                        // @ts-ignore
                        price: {
                          id: prices.nameToPrice(simulatedStoragePriceName) ?? '',
                          object: 'price'
                        }
                      }
                    ]
                  })
                ],
                object: 'list',
                has_more: false,
                url: ''
              },
              id: customerId
            }
          }
        })
      },
      prices
    )
    const gotSubscription = await subscriptions.getSubscription(customerId)
    assert.ok(gotSubscription && !(gotSubscription instanceof Error), 'getSubscription did not return an error')
    assert.equal(gotSubscription.storage?.price, simulatedStoragePriceName, '')
  })
})

describe('createStripeBillingContext', function () {
  it('subscriptions can only saveSubscription to known price ids', async function () {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return this.skip()
    }
    const billingContext = createStripeBillingContext({
      db: {
        ...createMockUserCustomerService(),
        ...createMockAgreementService()
      },
      STRIPE_SECRET_KEY: stripeSecretKey
    })
    const user = { id: '1', issuer: `user-${randomString()}` }
    const customer = await billingContext.customers.getOrCreateForUser(user)
    let saveDidError = false
    try {
      await billingContext.subscriptions.saveSubscription(customer.id, {
        storage: {
          // @ts-ignore
          price: 'fake_bad_price'
        }
      })
    } catch (error) {
      saveDidError = true
    } finally {
      assert.equal(saveDidError, true, 'saveSubscription should have thrown an error')
    }
  })
})

describe('createStripeStoragePricesFromEnv', function () {
  it('parses prices from env vars', function () {
    const prefix = randomString()
    /** @type {import('../src/utils/billing-types').NamedStripePrices} */
    const prices = createStripeStoragePricesFromEnv({
      [createStripeStorageEnvVar(storagePriceNames.free)]: `${prefix}_price_free`,
      [createStripeStorageEnvVar(storagePriceNames.lite)]: `${prefix}_price_lite`,
      [createStripeStorageEnvVar(storagePriceNames.pro)]: `${prefix}_price_pro`
    })
    assert.equal(prices.nameToPrice(storagePriceNames.free), `${prefix}_price_free`)
    assert.equal(prices.nameToPrice(storagePriceNames.lite), `${prefix}_price_lite`)
    assert.equal(prices.nameToPrice(storagePriceNames.pro), `${prefix}_price_pro`)
  })
})
