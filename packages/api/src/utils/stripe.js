import Stripe from 'stripe'
import { randomString } from './billing.js'

/**
 * @typedef {import('stripe').Stripe} StripeInterface
 */

/**
 * @typedef {import("./billing-types").BillingService} BillingService
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
    /**
     * @type {BillingService}
     */
    const instance = this // eslint-disable-line
  }

  async getPaymentMethod (customerId) {
    const response = await this.stripe.customers.retrieve(customerId, {
      expand: ['invoice_settings.default_payment_method']
    })
    if (response.object !== 'customer') {
      throw new Error('unable to get payment method')
    }
    if (response.deleted) {
      throw new Error('unexpected response.deleted')
    }
    const defaultPaymentMethod = response.invoice_settings.default_payment_method
    const defaultPaymentMethodObject = (typeof defaultPaymentMethod === 'string') ? { id: defaultPaymentMethod } : defaultPaymentMethod ?? {}
    const defaultPaymentMethodId = (typeof defaultPaymentMethod === 'string') ? defaultPaymentMethod : defaultPaymentMethod?.id
    if (!defaultPaymentMethodId) {
      throw new Error('unable to determine defaultPaymentMethodId for customer')
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
 * @typedef {(userId: string) => Promise<null|{ id: string }>} GetUserCustomer
 */

/**
 * @typedef {(userId: string, customerId: string) => Promise<any>} UpsertUserCustomer
 */

/**
 * @typedef {object} UserCustomerService
 * @property {GetUserCustomer} getUserCustomer
 * @property {UpsertUserCustomer} upsertUserCustomer
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
