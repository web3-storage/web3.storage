/* eslint-disable no-void */
import Stripe from 'stripe'
import { CustomerNotFound, hasOwnProperty, isStoragePriceName, randomString, storagePriceNames } from './billing.js'
import { stringToNumber } from './number.js'

/**
 * @typedef {import('./billing-types').StoragePriceName} StoragePriceName
 */

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
 * @property {Pick<StripeInterface['prices'], 'retrieve'>} prices
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
 * @property {StripeComCustomers['retrieve']} retrieve
 * @property {StripeComCustomers['update']} update
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
 * @typedef {import('./billing-types').AgreementService} AgreementService
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
    void /** @type {CustomersService} */ (this)
  }

  /**
   * Get Contact info for a customer
   * @param {Customer['id']} customerId
   * @returns {Promise<import('./billing-types').CustomerContact | CustomerNotFound>}
   */
  async getContact (customerId) {
    let stripeCustomer
    try {
      stripeCustomer = await this.stripe.customers.retrieve(customerId)
    } catch (error) {
      if (hasOwnProperty(error, 'code')) {
        switch (error.code) {
          case 'resource_missing':
            return new CustomerNotFound('customer not found')
        }
      }
      throw error
    }
    if (stripeCustomer.deleted) {
      return new CustomerNotFound('customer has been deleted')
    }
    /** @type {import('./billing-types').CustomerContact} */
    const contact = {
      name: stripeCustomer.name ?? undefined,
      email: stripeCustomer.email ?? undefined
    }
    return contact
  }

  /**
   * Update contact info for a customer
   * @param {Customer['id']} customerId
   * @param {import('./billing-types').CustomerContact} contact
   * @returns {Promise<void|CustomerNotFound>}
   */
  async updateContact (customerId, contact) {
    try {
      await this.stripe.customers.update(customerId, {
        name: contact.name,
        email: contact.email
      })
    } catch (error) {
      if (hasOwnProperty(error, 'code')) {
        switch (error.code) {
          case 'resource_missing':
            return new CustomerNotFound('customer not found')
        }
      }
      throw error
    }
  }

  /**
   * @param {import('./billing-types').BillingUser} user
   * @returns {Promise<import('./billing-types').Customer|null>}
   */
  async getForUser (user) {
    const customer = await this.userCustomerService.getUserCustomer(user.id.toString())

    if (!customer) return null

    return {
      id: customer.id
    }
  }

  /**
   * @param {import('./billing-types').BillingUser} user
   * @param {import('./billing-types').UserCreationOptions} [options]
   * @returns {Promise<import('./billing-types').Customer>}
   */
  async getOrCreateForUser (user, options) {
    const existingCustomer = await this.userCustomerService.getUserCustomer(user.id.toString())
    if (existingCustomer) return existingCustomer
    const createdCustomer = await this.stripe.customers.create({
      metadata: {
        'web3.storage/user.id': user.id
      },
      name: options?.name,
      email: options?.email
    })
    await this.userCustomerService.upsertUserCustomer(user.id.toString(), createdCustomer.id)
    const customer = {
      id: createdCustomer.id
    }
    return customer
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

/**
 * Create a mock stripe sdk instance that can be used with the StripeCustomersService
 * @returns {StripeComForCustomersService}
 */
export function createMockStripeForCustomersService () {
  /** @type {Map<string, Stripe.Customer>} */
  const idToCustomer = new Map()
  return {
    customers: {
      create: async () => {
        const customer = createMockStripeCustomer()
        idToCustomer.set(customer.id, customer)
        /** @type {Stripe.Response<Stripe.Customer>} */
        const response = {
          // @ts-ignore
          lastResponse: {},
          ...customer
        }
        return response
      },
      retrieve: async (id) => {
        const customer = idToCustomer.get(id)
        if (!customer) {
          throw new Error('customer not found')
        }
        /** @type {Stripe.Response<Stripe.Customer>} */
        const response = {
          // @ts-ignore
          lastResponse: {},
          ...customer
        }
        return response
      },
      update: async (id, params) => {
        const customer = idToCustomer.get(id)
        if (!customer) {
          throw new Error('customer not found')
        }
        const updatedCustomer = {
          ...customer,
          ...params
        }
        /** @type {Stripe.Response<Stripe.Customer>} */
        const response = {
          // @ts-ignore
          lastResponse: {},
          ...updatedCustomer
        }
        return response
      }
    }
  }
}

/**
 * @param {object} [options]
 * @param {(id: string) => Promise<undefined|Stripe.Customer|Stripe.DeletedCustomer>} [options.retrieveCustomer]
 * @param {(id: string) => Promise<undefined|Stripe.Price>} [options.retrievePrice]
 * @param {() => void} [options.onCreateSetupintent]
 * @returns {StripeComForBillingService}
 */
export function createMockStripeForBilling (options = {}) {
  const retrieveCustomer = options.retrieveCustomer || async function (id) {
    throw new Error(`no customer found with id=${id}`)
  }
  const retrievePrice = options.retrievePrice || async function (id) {
    throw new Error(`no price found with id=${id}`)
  }
  /** @type {StripeComForBillingService['prices']} */
  const prices = {
    async retrieve (id, params) {
      const price = await retrievePrice(id)
      /** @type {Stripe.Response<Stripe.Price>} */
      const response = {
        ...price,
        // @ts-ignore
        lastResponse: undefined
      }
      return response
    }
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
  return { paymentMethods, customers, prices, setupIntents }
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
    },
    subscriptions: {
      data: [],
      object: 'list',
      has_more: false,
      url: ''
    }
  }
}

/**
 * Create some billing services based on the provided environment vars.
 * If there is a stripe.com secret, the implementations will use the stripe.com APIs.
 * Otherwise the mock implementations will be used.
 * @param {object} env
 * @param {string} env.STRIPE_SECRET_KEY
 * @param {Pick<DBClient, 'upsertUserCustomer'|'getUserCustomer'|'createUserAgreement'>} env.db
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
  /** @type {UserCustomerService} */
  const userCustomerService = {
    upsertUserCustomer: env.db.upsertUserCustomer.bind(env.db),
    getUserCustomer: env.db.getUserCustomer.bind(env.db)
  }
  const customers = StripeCustomersService.create(stripe, userCustomerService)
  /** @type {AgreementService} */
  const agreements = {
    createUserAgreement: env.db.createUserAgreement.bind(env.db)
  }
  // attempt to get stripe price IDs from env vars
  let stripePrices
  try {
    stripePrices = createStripeStoragePricesFromEnv(env)
  } catch (error) {
    if (error instanceof EnvVarMissingError) {
      console.error('env var missing, defaulting to stagingStripePrices', error)
      // default prices to use staging values if we cannot set them from the env
      stripePrices = stagingStripePrices
    } else {
      throw error
    }
  }
  const subscriptions = StripeSubscriptionsService.create(stripe, stripePrices)
  return {
    agreements,
    billing,
    customers,
    subscriptions
  }
}

export class NamedStripePrices {
  /**
   * @param {Record<import('./billing-types').StoragePriceName, string>} namedPrices
   */
  constructor (namedPrices) {
    this.namedPrices = namedPrices
    void /** @type {import('./billing-types').NamedStripePrices} */ (this)
  }

  /**
   * @param {StoragePriceName} name
   * @returns {StripePriceId|undefined}
   */
  nameToPrice (name) {
    const priceId = this.namedPrices[name]
    if (priceId) {
      return /** @type {StripePriceId} */ (priceId)
    }
  }

  /**
   * @param {string} priceId
   * @returns {StoragePriceName|undefined}
   */
  priceToName (priceId) {
    const priceName = Object.keys(this.namedPrices).find(name => this.namedPrices[name] === priceId)
    if (isStoragePriceName(priceName)) {
      return priceName
    }
  }
}

// https://dashboard.stripe.com/test/prices/price_1Li2ISIfErzTm2rEg4wD9BR2
export const testPriceForStorageFree = 'price_1Li2ISIfErzTm2rEg4wD9BR2'
// https://dashboard.stripe.com/test/prices/price_1LhdqgIfErzTm2rEqfl6EgnT
export const testPriceForStorageLite = 'price_1LhdqgIfErzTm2rEqfl6EgnT'
// https://dashboard.stripe.com/test/prices/price_1Li1upIfErzTm2rEIDcI6scF
export const testPriceForStoragePro = 'price_1Li1upIfErzTm2rEIDcI6scF'

export const stagingStripePrices = new NamedStripePrices({
  free: testPriceForStorageFree,
  lite: testPriceForStorageLite,
  pro: testPriceForStoragePro
})

/**
 * @typedef {object} StripeApiForSubscriptionsService
 * @property {Pick<Stripe['subscriptions'], 'cancel'|'create'>} subscriptions
 * @property {Pick<Stripe['subscriptionItems'], 'update'|'del'>} subscriptionItems
 * @property {Pick<Stripe['customers'], 'retrieve'>} customers
 * @property {Pick<Stripe['prices'], 'retrieve'>} prices
 */

/**
 * @param {object} [options]
 * @param {(...args: Parameters<Stripe['subscriptions']['create']>) => void} [options.onSubscriptionCreate]
 * @param {(id: string) => Promise<undefined|Stripe.Customer|Stripe.DeletedCustomer>} [options.retrieveCustomer]
 * @returns {StripeApiForSubscriptionsService}
 */
export function createMockStripeForSubscriptions (options = {}) {
  return {
    ...createMockStripeForBilling({
      retrieveCustomer: options.retrieveCustomer
    }),
    subscriptions: {
      async cancel (id, params) {
        return {
          id,
          object: 'subscription',
          status: 'canceled',
          cancel_at_period_end: false,
          canceled_at: Number(new Date()),
          ...params
        }
      },
      async create (...args) {
        options?.onSubscriptionCreate?.(...args)
        /** @type {Stripe.Response<Stripe.Subscription>} */
        const subscription = {
          id: `sub_${randomString()}`,
          object: 'subscription',
          // @ts-ignore
          lastResponse: undefined
        }
        return subscription
      }
    },
    subscriptionItems: {
      async del (id, options) {
        /** @type {Stripe.Response<Stripe.DeletedSubscriptionItem>} */
        const response = {
          // @ts-ignore
          lastResponse: undefined
        }
        return response
      },
      async update (id, params, options) {
        /** @type {Stripe.SubscriptionItem} */
        // @ts-ignore
        const item = {
          id,
          object: 'subscription_item',
          ...params,
          created: Number(new Date())
        }
        /** @type {Stripe.Response<Stripe.SubscriptionItem>} */
        const response = {
          ...item,
          // @ts-ignore
          lastResponse: undefined
        }
        return response
      }
    }
  }
}

/**
 * @param {object} [options]
 * @param {Stripe.SubscriptionItem[]} [options.items]
 * @returns
 */
export function createMockStripeSubscription (options = {}) {
  /** @type {Stripe.Subscription} */
  // @ts-ignore
  const subscription = {
    id: `sub_${randomString()}`,
    object: 'subscription',
    items: {
      object: 'list',
      has_more: false,
      url: '',
      data: [
        ...options.items ?? []
      ]
    }
  }
  return subscription
}

/**
 * A SubscriptionsService that uses stripe.com for storage
 */
export class StripeSubscriptionsService {
  /**
   * @param {StripeApiForSubscriptionsService} stripe
   * @param {import('./billing-types').NamedStripePrices} prices
   */
  static create (stripe, prices) {
    return new StripeSubscriptionsService(
      stripe,
      prices
    )
  }

  /**
   * @param {StripeApiForSubscriptionsService} stripe
   * @param {import('./billing-types').NamedStripePrices} priceNamer
   * @protected
   */
  constructor (stripe, priceNamer) {
    /** @type {StripeApiForSubscriptionsService} */
    this.stripe = stripe
    /** @type {import('./billing-types').NamedStripePrices} */
    this.priceNamer = priceNamer
    void /** @type {import('./billing-types').SubscriptionsService} */ (this)
  }

  /**
   * @param {string} customerId
   * @returns {Promise<import('./billing-types').W3PlatformSubscription|CustomerNotFound>}
   */
  async getSubscription (customerId) {
    const storageStripeSubscription = await this.getStorageStripeSubscription(customerId)
    if (storageStripeSubscription instanceof CustomerNotFound) { return storageStripeSubscription }

    if (!storageStripeSubscription) {
      return {
        storage: null
      }
    }

    if (storageStripeSubscription.items.data.length > 1) {
      throw new Error(
        `subscription ${storageStripeSubscription.id} has ${storageStripeSubscription.items.data?.length} items, but we only expect to ever see one.`
      )
    }

    // @todo - be more clever in ensuring this came from correct subscription item
    // or consider throwing if there is more than one subscription item
    const stripePrice = /** @type {Stripe.Response<Stripe.Price>} */ (
      storageStripeSubscription.items.data[0].price
    )

    const storagePriceName = this.priceNamer.priceToName(stripePrice.id)

    if (storagePriceName) {
      /** @type {import('./billing-types').W3PlatformSubscription['storage']} */
      return {
        storage: {
          price: storagePriceName
        }
      }
    }

    const expandedStripePrice = await this.getStripePrice(stripePrice.id)

    if (!expandedStripePrice) {
      throw new Error(`there was an error fetching price for price id ${stripePrice.id}}`)
    }

    /** @type {import('./billing-types').W3PlatformSubscription['storage']} */
    return {
      storage: {
        price: expandedStripePrice
      }
    }
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
   * Fetches a price from stripe and maps it to our custom price type
   *
   * @param {string} priceId
   * @returns {Promise<import('./billing-types').CustomStoragePrice>}
   */
  async getStripePrice (priceId) {
    const price = await this.stripe.prices.retrieve(priceId, {
      expand: ['tiers']
    })

    if (!price.active) {
      throw new Error(`price with id ${priceId} is not active`)
    }

    return {
      id: price.id,
      label: price.metadata['UI Label'] ?? 'Custom',
      description: price.metadata?.Description,
      bandwidth: stringToNumber(price.metadata?.Bandwidth),
      isPreferred: price.metadata?.Preferred === 'true',
      tiers: price.tiers?.map((tier) => ({
        flatAmount: tier.flat_amount,
        unitAmount: tier.unit_amount,
        upTo: tier.up_to
      })) ?? null
    }
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
    if (!storageSubscription) {
      if (existingStorageStripeSubscriptionItem) {
        await this.stripe.subscriptions.cancel(existingStripeSubscription.id)
      }
      return null
    }
    const priceName = storageSubscription.price
    const desiredPriceId = typeof priceName === 'string' ? this.priceNamer.nameToPrice(priceName) : null
    if (!desiredPriceId) {
      throw new Error(`invalid price name: ${priceName}`)
    }
    const desiredSubscriptionItem = {
      price: desiredPriceId
    }
    /** @type {string|undefined} */
    let subscriptionId
    // if there's an existing subscription, modify it
    if (existingStorageStripeSubscriptionItem && existingStripeSubscription) {
      if (!storageSubscription) {
        // delete
        await this.stripe.subscriptions.cancel(existingStripeSubscription.id)
        return null
      }
      // update
      const updatedSubItem = await this.stripe.subscriptionItems.update(
        existingStorageStripeSubscriptionItem.id,
        desiredSubscriptionItem
      )
      subscriptionId = updatedSubItem.subscription
    } else {
      // create subscription with item
      const created = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          desiredSubscriptionItem
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
 * @typedef {`price_${string}`} StripePriceId
 */

/**
 * Get the environment variable that may hold the price id for a
 * given storage price name
 * @param {StoragePriceName} priceName
 */
export function createStripeStorageEnvVar (priceName) {
  return `STRIPE_STORAGE_PRICE_${priceName.toUpperCase()}`
}

class EnvVarMissingError extends Error {}

/**
 * @param {Record<string,any>} env
 */
export function createStripeStoragePricesFromEnv (env) {
  /**
   * @param {StoragePriceName} priceName
   * @returns {StripePriceId}
   */
  const readPriceNameVar = (priceName) => {
    const varName = createStripeStorageEnvVar(priceName)
    if (!(varName in env)) {
      throw new EnvVarMissingError(`missing env var ${varName}`)
    }
    const priceId = /** @type {unknown} */ (env[varName])
    if (typeof priceId !== 'string') {
      throw new Error(`unable to read string value for env.${varName} for storage price name ${priceName}`)
    }
    return /** @type {StripePriceId} */ (priceId)
  }
  return new NamedStripePrices(/** @type {Record<StoragePriceName, string>} */ ({
    [storagePriceNames.free]: readPriceNameVar(storagePriceNames.free),
    [storagePriceNames.lite]: readPriceNameVar(storagePriceNames.lite),
    [storagePriceNames.pro]: readPriceNameVar(storagePriceNames.pro)
  }))
}
