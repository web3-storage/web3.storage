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
