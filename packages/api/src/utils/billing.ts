export type StripePaymentMethodId = `pm_{string}`;
export type StripeCustomerId = string;

export type StripePaymentMethod = {
  id: StripePaymentMethodId
}

export interface BillingService {
  savePaymentMethod(
    customer: StripeCustomerId,
    paymentMethodId: StripePaymentMethodId
  ): Promise<void>;
}

/**
 * @typedef {object} BillingContext
 * @property {import('../src/utils/billing').CustomersService} customers
 * @property {import('../src/utils/billing').BillingService} billing
 * @property {{id: string }} user
 */

/**
 * Save a user's payment settings
 * @param {BillingContext} ctx
 * @param {object} paymentSettings
 * @param {Pick<import('../src/utils/billing').StripePaymentMethod, 'id'>} paymentSettings.method
 */
export async function savePaymentSettings(ctx, paymentSettings) {
  const { billing, customers, user } = ctx;
  const customer = await customers.getOrCreateForUser(user)
  await billing.savePaymentMethod(paymentSettings.method)
}
