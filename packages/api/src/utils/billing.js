/**
 * @typedef {object} BillingContext
 * @property {import('./billing-types').CustomersService} customers
 * @property {import('./billing-types').BillingService} billing
 * @property {{id: string }} user
 */

/**
 * Save a user's payment settings
 * @param {BillingContext} ctx
 * @param {object} paymentSettings
 * @param {Pick<import('./billing-types').StripePaymentMethod, 'id'>} paymentSettings.method
 */
export async function savePaymentSettings (ctx, paymentSettings) {
  const { billing, customers, user } = ctx
  const customer = await customers.getOrCreateForUser(user)
  await billing.savePaymentMethod(customer.id, paymentSettings.method.id)
}
