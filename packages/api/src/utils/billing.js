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

/**
 * @returns {import('src/utils/billing-types.js').CustomersService & { mockCustomers: Array<{ id: string }> }}
 */
export function createMockCustomerService () {
  const mockCustomers = []
  /**
   * @returns {Promise<{ id: string }>}
   */
  async function getOrCreateForUser () {
    const created = { id: `customer-${Math.random().toString().slice(2)}` }
    mockCustomers.push(created)
    return created
  }
  return {
    getOrCreateForUser,
    mockCustomers
  }
}

export function randomString () {
  return Math.random().toString().slice(2)
}

export function createMockBillingService () {
  const paymentMethodSaves = []
  const billing = {
    async savePaymentMethod (customerId, methodId) {
      paymentMethodSaves.push({ customerId, methodId })
    },
    paymentMethodSaves
  }
  return billing
}
