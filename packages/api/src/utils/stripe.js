import Stripe from 'stripe'

/**
 * @typedef {import('stripe').Stripe} StripeInterface
 */

/**
 * @typedef {import("./billing-types").BillingService} BillingService
 */

/**
 * A BillingService that uses stripe.com
 */
export class StripeBillingService {
  static create () {
    return new StripeBillingService()
  }

  /**
   * @protected
   */
  constructor () {
    /**
     * @type {BillingService}
     */
    const instance = this // eslint-disable-line
  }

  /**
   * @param {import('./billing-types').StripeCustomerId} customer
   * @param {import('./billing-types').StripePaymentMethodId} method
   * @returns {Promise<void>}
   */
  async savePaymentMethod (customer, method) {

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
 * @typedef {(userId: string) => Promise<{ id: string }>} GetUserCustomer
 */

/**
 * A CustomersService that uses stripe.com for storage
 */
export class StripeCustomersService {
  /**
   * @param {StripeComForCustomersService} stripe
   * @param {GetUserCustomer} getUserCustomer
   */
  static create (stripe, getUserCustomer) {
    return new StripeCustomersService(stripe, getUserCustomer)
  }

  /**
   * @param {StripeComForCustomersService} stripe
   * @param {GetUserCustomer} getUserCustomer
   * @protected
   */
  constructor (stripe, getUserCustomer) {
    /** @type {GetUserCustomer} */
    this.getUserCustomer = getUserCustomer
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
    const existingCustomer = await this.getUserCustomer(user.id)
    console.log({ existingCustomer })
    if (existingCustomer) return existingCustomer
    const createdCustomer = await this.stripe.customers.create({
      metadata: {
        'web3.storage/user.id': user.id
      }
    })
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
