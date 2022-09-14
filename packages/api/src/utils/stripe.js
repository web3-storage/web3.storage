/* eslint-disable no-void */
import Stripe from 'stripe'
import { CustomerNotFound, randomString } from './billing.js'

/**
 * @typedef {import('stripe').Stripe} StripeInterface
 */

/**
 * @typedef {import("./billing-types").BillingService} BillingService
 * @typedef {import("./billing-types").PaymentMethod} PaymentMethod
 */

/**
 * @typedef {object} StripeComForBillingService
 * @property {Pick<StripeInterface['paymentMethods'], 'attach'>} paymentMethods
 * @property {Pick<StripeInterface['setupIntents'], 'create'>} setupIntents
 * @property {Pick<StripeInterface['customers'], 'retrieve'|'update'>} customers
 */

/**
 * A BillingService that uses stripe.com
 */
export class StripeBillingService {
  /**
   * @param {StripeComForBillingService} stripe
   */
  static create (stripe) {
    return new StripeBillingService(stripe)
  }

  /**
   * @protected
   * @param {StripeComForBillingService} stripe
   */
  constructor (stripe) {
    /** @type {StripeComForBillingService}  */
    this.stripe = stripe
    void /** @type {BillingService} */ (this)
  }

  /**
   * @param {string} customerId
   * @returns {Promise<null | CustomerNotFound | PaymentMethod>}
   */
  async getPaymentMethod (customerId) {
    const response = await this.stripe.customers.retrieve(customerId, {
      expand: ['invoice_settings.default_payment_method']
    })
    if (response.deleted) {
      return new CustomerNotFound('customer retrieved from stripe has been unexpectedly deleted')
    }
    const defaultPaymentMethod = response.invoice_settings.default_payment_method
    const defaultPaymentMethodObject = (typeof defaultPaymentMethod === 'string') ? { id: defaultPaymentMethod } : defaultPaymentMethod ?? {}
    const defaultPaymentMethodId = (typeof defaultPaymentMethod === 'string') ? defaultPaymentMethod : defaultPaymentMethod?.id
    if (!defaultPaymentMethodId) {
      return null
    }
    /** @type {import('./billing-types').PaymentMethod} */
    const paymentMethod = ('card' in defaultPaymentMethodObject)
      ? stripeToStripeCardPaymentMethod(defaultPaymentMethodObject)
      : {
          id: defaultPaymentMethodId
        }
    return paymentMethod
  }

  /**
   * @param {import('./billing-types').CustomerId} customer
   * @param {import('./billing-types').PaymentMethod['id']} method
   * @returns {Promise<void>}
   */
  async savePaymentMethod (customer, method) {
    // @todo - this shouldn't create if one already exists :/
    const setupIntent = await this.stripe.setupIntents.create({
      payment_method: method,
      confirm: true,
      customer
    })
    if (setupIntent.status !== 'succeeded') {
      console.warn('setupIntent created, but status is not yet succeeded', setupIntent)
    }
    const desiredDefaultPaymentMethod = setupIntent.payment_method
    if (!desiredDefaultPaymentMethod) {
      throw new Error('unable to determine desiredDefaultPaymentMethod')
    }
    // set default_payment_method to this method
    await this.stripe.customers.update(customer, {
      invoice_settings: {
        default_payment_method: desiredDefaultPaymentMethod.toString()
      }
    })
  }
}

/**
 * @param {Stripe.PaymentMethod} paymentMethod
 * @returns {import('./billing-types').StripeCardPaymentMethod}
 */
export function stripeToStripeCardPaymentMethod (paymentMethod) {
  const stripeCard = ('card' in paymentMethod)
    ? paymentMethod.card
    : undefined
  if (!stripeCard) {
    throw new Error('failed to get stripeCard from paymentMethod')
  }
  return {
    // @ts-ignore
    id: paymentMethod.id,
    card: {
      '@type': 'https://stripe.com/docs/api/cards/object',
      brand: stripeCard.brand,
      country: stripeCard.country,
      exp_month: stripeCard.exp_month,
      exp_year: stripeCard.exp_year,
      funding: stripeCard.funding,
      last4: stripeCard.last4
    }
  }
}

/**
 * @typedef {import("./billing-types").CustomersService} CustomersService
 */

/**
 * @typedef {import("./billing-types").Customer} Customer
 */

/**
 * @typedef {import('stripe').Stripe['customers']} StripeComCustomers
 */

/**
 * @typedef {object} StripeComCustomersForGetOrCreate
 * @property {StripeComCustomers['create']} create
 */

/**
 * @typedef {object} StripeComForCustomersService
 * @property {StripeComCustomersForGetOrCreate} customers
 */

/**
 * @typedef {import('@web3-storage/db').DBClient} DBClient
 */

/**
 * @typedef {Pick<DBClient, 'getUserCustomer'>} DBClientForStripeCustomersService
 */

/**
 * @typedef {import('./billing-types').UserCustomerService} UserCustomerService
 */

/**
 * A CustomersService that uses stripe.com for storage
 */
export class StripeCustomersService {
  /**
   * @param {StripeComForCustomersService} stripe
   * @param {UserCustomerService} userCustomerService
   */
  static create (stripe, userCustomerService) {
    return new StripeCustomersService(stripe, userCustomerService)
  }

  /**
   * @param {StripeComForCustomersService} stripe
   * @param {UserCustomerService} userCustomerService
   * @protected
   */
  constructor (stripe, userCustomerService) {
    /** @type {UserCustomerService} */
    this.userCustomerService = userCustomerService
    /** @type {StripeComForCustomersService} */
    this.stripe = stripe
    /**
     * @type {CustomersService}
     */
    const instance = this // eslint-disable-line
  }

  /**
   * @param {{id: string}} user
   * @returns {Promise<Customer>}
   */
  async getOrCreateForUser (user) {
    const existingCustomer = await this.userCustomerService.getUserCustomer(user.id)
    if (existingCustomer) return existingCustomer
    const createdCustomer = await this.stripe.customers.create({
      metadata: {
        'web3.storage/user.id': user.id
      }
    })
    await this.userCustomerService.upsertUserCustomer(user.id, createdCustomer.id)
    return createdCustomer
  }
}

/**
 * @param {string} secretKey
 * @returns {StripeInterface}
 */
export function createStripe (secretKey) {
  return new Stripe(secretKey, {
    apiVersion: '2022-08-01',
    httpClient: Stripe.createFetchHttpClient()
  })
}

/**
 * Create a mock StripeCard paymentMethod
 * @returns
 */
export function createMockStripeCardPaymentMethod () {
  return {
    id: `pm_${randomString()}`,
    card: {
      '@type': 'https://stripe.com/docs/api/cards/object',
      brand: 'visa',
      country: 'US',
      exp_month: 9,
      exp_year: 2023,
      funding: 'credit',
      last4: '4242'
    }
  }
}

/** @returns {StripeComForCustomersService} */
export function createMockStripeForCustomersService () {
  return {
    customers: {
      create: async () => {
        const customer = createMockStripeCustomer()
        /** @type {Stripe.Response<Stripe.Customer>} */
        const response = {
          // @ts-ignore
          lastResponse: {},
          ...customer
        }
        return response
      }
    }
  }
}

/**
 * @param {object} [options]
 * @param {(id: string) => Promise<undefined|Stripe.Customer|Stripe.DeletedCustomer>} [options.retrieveCustomer]
 * @param {() => void} [options.onCreateSetupintent]
 * @returns {StripeComForBillingService}
 */
export function createMockStripeForBilling (options = {}) {
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
  /** @type {StripeComForBillingService['customers']} */
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
  /** @type {StripeComForBillingService['setupIntents']} */
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
export function createMockStripeCustomer (options = {}) {
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
 * Create some billing services based on the provided environment vars.
 * If there is a stripe.com secret, the implementations will use the stripe.com APIs.
 * Otherwise the mock implementations will be used.
 * @param {object} env
 * @param {string} env.STRIPE_SECRET_KEY
 * @param {DBClient} env.db
 * @returns {import('./billing-types').BillingEnv}
 */
export function createStripeBillingContext (env) {
  const stripeSecretKey = env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    throw new Error('Please set the required STRIPE_SECRET_KEY environment variable')
  }
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2022-08-01',
    httpClient: Stripe.createFetchHttpClient()
  })
  const billing = StripeBillingService.create(stripe)
  const userCustomerService = {
    upsertUserCustomer: env.db.upsertUserCustomer.bind(env.db),
    getUserCustomer: env.db.getUserCustomer.bind(env.db)
  }
  const customers = StripeCustomersService.create(stripe, userCustomerService)
  const subscriptions = StripeSubscriptionsService.create(stripe)
  return {
    billing,
    customers,
    subscriptions
  }
}

/**
 * @typedef {object} StripeApiForSubscriptionsService
 * @property {Pick<Stripe['subscriptions'], 'cancel'|'create'>} subscriptions
 * @property {Pick<Stripe['subscriptionItems'], 'update'|'del'>} subscriptionItems
 * @property {Pick<Stripe['customers'], 'retrieve'>} customers
 */

/**
 * A SubscriptionsService that uses stripe.com for storage
 */
export class StripeSubscriptionsService {
  /**
   * @param {StripeApiForSubscriptionsService} stripe
   */
  static create (stripe) {
    return new StripeSubscriptionsService(stripe)
  }

  /**
   * @param {StripeApiForSubscriptionsService} stripe
   * @protected
   */
  constructor (stripe) {
    /** @type {StripeApiForSubscriptionsService} */
    this.stripe = stripe
    /**
     * @type {import('./billing-types').SubscriptionsService}
     */
    const instance = this // eslint-disable-line
  }

  /**
   * @param {string} customerId
   * @returns {Promise<import('./billing-types').W3PlatformSubscription|CustomerNotFound>}
   */
  async getSubscription (customerId) {
    const storageStripeSubscription = await this.getStorageStripeSubscription(customerId)
    if (storageStripeSubscription instanceof CustomerNotFound) { return storageStripeSubscription }
    /** @returns {import('./billing-types').W3PlatformSubscription} */
    const subscription = {
      storage: createW3StorageSubscription(storageStripeSubscription)
    }
    return subscription
  }

  async getStorageStripeSubscription (customerId) {
    const customer = await this.stripe.customers.retrieve(customerId, {
      expand: ['subscriptions']
    })
    if (customer.deleted) {
      return new CustomerNotFound('customer retrieved from stripe has been unexpectedly deleted')
    }
    const { subscriptions: stripeSubscriptions } = customer
    if (!stripeSubscriptions) {
      // this is unexpected, since we requested expand=subscriptions above
      throw new Error('expected subscriptions to be expanded, but got falsy value')
    }
    const storageStripeSubscription = selectStorageStripeSubscription(customerId, stripeSubscriptions)
    return storageStripeSubscription
  }

  /**
   *
   * @param {import('./billing-types').CustomerId} customerId
   * @param {import('./billing-types').W3PlatformSubscription} subscription
   * @returns {Promise<CustomerNotFound|void>}
   */
  async saveSubscription (customerId, subscription) {
    const storageStripeSubscription = await this.getStorageStripeSubscription(customerId)
    if (storageStripeSubscription instanceof Error) { return storageStripeSubscription }
    await this.saveStorageSubscription(customerId, subscription.storage, storageStripeSubscription ?? undefined)
  }

  /**
   * @param {import('./billing-types').CustomerId} customerId
   * @param {import('./billing-types').W3PlatformSubscription['storage']} storageSubscription
   * @param {Stripe.Subscription} [existingStripeSubscription]
   * @returns {Promise<import('./billing-types').W3StorageStripeSubscription|null>}
   */
  async saveStorageSubscription (customerId, storageSubscription, existingStripeSubscription = undefined) {
    const existingStorageStripeSubscriptionItem = existingStripeSubscription && selectStorageStripeSubscriptionItem(existingStripeSubscription)
    /** @type {Stripe.SubscriptionCreateParams.Item | null} */
    const storageMeteringSubscriptionItem = storageSubscription?.price
      ? {
          price: storageSubscription?.price
        }
      : null
    /** @type {string|undefined} */
    let subscriptionId
    if (existingStorageStripeSubscriptionItem && existingStripeSubscription) {
      if (!storageSubscription) {
        // delete
        await this.stripe.subscriptions.cancel(existingStripeSubscription.id)
        return null
      }
      // update
      const updatedSubItem = await this.stripe.subscriptionItems.update(
        existingStorageStripeSubscriptionItem.id,
        {
          price: storageSubscription.price
        }
      )
      subscriptionId = updatedSubItem.subscription
    } else {
      // create subscription with item
      const created = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          ...(storageMeteringSubscriptionItem ? [storageMeteringSubscriptionItem] : [])
        ],
        payment_behavior: 'error_if_incomplete'
      })
      subscriptionId = created.id
    }
    /** @type {import('./billing-types').W3StorageStripeSubscription} */
    const subscription = { id: subscriptionId }
    return subscription
  }
}

// https://dashboard.stripe.com/test/prices/price_1Li2ISIfErzTm2rEg4wD9BR2
export const testPriceForStorageFree = 'price_1Li2ISIfErzTm2rEg4wD9BR2'
// https://dashboard.stripe.com/test/prices/price_1LhdqgIfErzTm2rEqfl6EgnT
export const testPriceForStorageLite = 'price_1LhdqgIfErzTm2rEqfl6EgnT'
// https://dashboard.stripe.com/test/prices/price_1Li1upIfErzTm2rEIDcI6scF
export const testPriceForStoragePro = 'price_1Li1upIfErzTm2rEIDcI6scF'

/**
 * @param {string} customerId
 * @param {Stripe.ApiList<Stripe.Subscription>} stripeSubscriptions
 * @returns {Stripe.Subscription | null}
 */
function selectStorageStripeSubscription (customerId, stripeSubscriptions) {
  if (stripeSubscriptions.data.length === 0) {
    return null
  }
  if (stripeSubscriptions.data.length > 1) {
    throw new Error(`customer ${customerId} has ${stripeSubscriptions?.data?.length} subscriptions, but we only expect to ever see one.`)
  }
  // @todo - this isn't very clever. We should be more clever, or maybe throw when there are >1 subscriptions
  const stripeSubscription = stripeSubscriptions.data[0]
  return stripeSubscription
}

/**
 * @param {Stripe.Subscription} stripeSubscription
 * @returns {Stripe.SubscriptionItem}
 */
function selectStorageStripeSubscriptionItem (stripeSubscription) {
  const { items } = stripeSubscription
  if (items.data.length !== 1) {
    throw new Error(`unexpected number of subscription items: ${items.data.length}`)
  }
  const item = items.data[0]
  return item
}

/**
 * @param {null|Stripe.Subscription} stripeSubscription
 * @returns {import('./billing-types').W3PlatformSubscription['storage']}
 */
function createW3StorageSubscription (stripeSubscription) {
  if (!stripeSubscription) {
    return null
  }
  if (stripeSubscription.items.data.length > 1) {
    throw new Error(`subscription ${stripeSubscription.id} has ${stripeSubscription.items.data?.length} items, but we only expect to ever see one.`)
  }
  // @todo - be more clever in ensuring this came from correct subscription item
  // or consider throwing if there is more than one subscription item
  const storagePrice = stripeSubscription.items.data[0].price.id
  /** @type {import('./billing-types').W3PlatformSubscription['storage']} */
  const storageSubscription = {
    price: storagePrice
  }
  return storageSubscription
}
