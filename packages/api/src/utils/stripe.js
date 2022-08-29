/**
 * @typedef {import("./billing").BillingService} BillingService
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
   * @param {import('./billing').StripeCustomerId} customer
   * @param {import('./billing').StripePaymentMethodId} method
   * @returns {Promise<void>}
   */
  async savePaymentMethod (customer, method) {

  }
}
