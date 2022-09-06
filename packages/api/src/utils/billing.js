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
 * Get a user's payment settings
 * @param {object} ctx
 * @param {import('./billing-types').BillingService} ctx.billing
 * @param {import('./billing-types').CustomersService} ctx.customers
 * @param {import('./billing-types').BillingUser} ctx.user
 * @returns {Promise<import('./billing-types').PaymentSettings>}
 */
export async function getPaymentSettings (ctx) {
  const { billing, customers, user } = ctx
  const customer = await customers.getOrCreateForUser(user)
  const paymentMethod = await billing.getPaymentMethod(customer.id)
  const settings = { method: paymentMethod }
  return settings
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

/**
 *
 * @returns {import('src/utils/billing-types.js').BillingService & { paymentMethodSaves: Array<{ customerId: string, methodId: string }> }}
 */
export function createMockBillingService () {
  const paymentMethodSaves = []
  const billing = {
    /**
     * @returns {Promise<import('./billing-types').PaymentMethod>}
     */
    async getPaymentMethod () {
      const paymentMethod = createMockPaymentMethod()
      return paymentMethod
    },
    async savePaymentMethod (customerId, methodId) {
      paymentMethodSaves.push({ customerId, methodId })
    },
    paymentMethodSaves
  }
  return billing
}

/**
 * @returns {import('./billing-types').StripePaymentMethod}
 */
export function createMockPaymentMethod () {
  return {
    id: `pm_${randomString()}`
  }
}
