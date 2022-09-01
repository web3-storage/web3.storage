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
 * A CustomersService that uses stripe.com for storage
 */
export class StripeCustomersService {
  static create () {
    return new StripeCustomersService()
  }

  /**
   * @protected
   */
  constructor () {
    /**
     * @type {CustomersService}
     */
    const instance = this // eslint-disable-line
  }

  /**
   * @param {any} user
   * @returns {Promise<Customer>}
   */
  async getOrCreateForUser (user) {
    return { id: `customer-${Math.random().toString().slice(2)}` }
  }
}
