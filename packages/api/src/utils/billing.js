/**
 * Save a user's payment settings
 * @param {object} ctx
 * @param {import('./billing-types').BillingService} ctx.billing
 * @param {import('./billing-types').CustomersService} ctx.customers
 * @param {import('./billing-types').BillingUser} ctx.user
 * @param {object} paymentSettings
 * @param {Pick<import('./billing-types').StripePaymentMethod, 'id'>} paymentSettings.method
 */
export async function savePaymentSettings (ctx, paymentSettings) {
  const { billing, customers, user } = ctx
  const customer = await customers.getOrCreateForUser(user)
  await billing.savePaymentMethod(customer.id, paymentSettings.method.id)
}
