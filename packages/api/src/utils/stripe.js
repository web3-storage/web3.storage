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
 * @property {StripeComCustomers['search']} search
 */

/**
 * @typedef {object} StripeComForCustomersService
 * @property {StripeComCustomersForGetOrCreate} customers
 */

/**
 * A CustomersService that uses stripe.com for storage
 */
export class StripeCustomersService {
  /**
   * @param {StripeComForCustomersService} stripe
   */
  static create (stripe) {
    return new StripeCustomersService(stripe)
  }

  /**
   * @param {StripeComForCustomersService} stripe
   * @protected
   */
  constructor (stripe) {
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
    const userIdMetadataProperty = 'web3StorageUserId'
    // const searchQuery = `metadata["${userIdMetadataProperty}"]:"${user.id}"`
    const searchQuery = `metadata["${userIdMetadataProperty}"]:"${user.id}"`
    // console.log({ searchQuery })
    const searchResponse = await this.stripe.customers.search({
      query: searchQuery
    })
    // console.log({ searchResponse })
    const existingCustomer = searchResponse.data[0]
    const customerFromStripeCustomer = (customer) => {
      return { id: customer.id }
    }
    if (existingCustomer) return customerFromStripeCustomer(existingCustomer)
    const createdCustomer = await this.stripe.customers.create({
      metadata: {
        [userIdMetadataProperty]: user.id,
        key: 'value'
      }
    })
    // console.log({ createdCustomer })
    return customerFromStripeCustomer(createdCustomer)
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
