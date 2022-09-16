/* eslint-disable no-void */

/**
 * @typedef {import('./billing-types').StoragePriceName} StoragePriceName
 */

/**
 * Save a user's payment settings
 * @param {object} ctx
 * @param {import('./billing-types').BillingService} ctx.billing
 * @param {import('./billing-types').CustomersService} ctx.customers
 * @param {import('./billing-types').SubscriptionsService} ctx.subscriptions
 * @param {import('./billing-types').BillingUser} ctx.user
 * @param {object} paymentSettings
 * @param {Pick<import('./billing-types').PaymentMethod, 'id'>} paymentSettings.method
 * @param {import('./billing-types').W3PlatformSubscription} paymentSettings.subscription
 */
export async function savePaymentSettings (ctx, paymentSettings) {
  const { billing, customers, user } = ctx
  const customer = await customers.getOrCreateForUser(user)
  await billing.savePaymentMethod(customer.id, paymentSettings.method.id)
  await ctx.subscriptions.saveSubscription(customer.id, paymentSettings.subscription)
}

/**
 * Get a user's payment settings
 * @param {object} ctx
 * @param {import('./billing-types').BillingService} ctx.billing
 * @param {import('./billing-types').CustomersService} ctx.customers
 * @param {import('./billing-types').SubscriptionsService} ctx.subscriptions
 * @param {import('./billing-types').BillingUser} ctx.user
 * @returns {Promise<import('./billing-types').PaymentSettings|CustomerNotFound>}
 */
export async function getPaymentSettings (ctx) {
  const { billing, customers, user } = ctx
  const customer = await customers.getOrCreateForUser(user)
  const paymentMethod = await billing.getPaymentMethod(customer.id)
  if (paymentMethod instanceof Error) {
    throw paymentMethod
  }
  const subscription = await ctx.subscriptions.getSubscription(customer.id)
  if (subscription instanceof Error) {
    return subscription
  }
  /** @type {import('./billing-types').PaymentSettings} */
  const settings = {
    method: paymentMethod,
    subscription
  }
  return settings
}

/**
 * @returns {import('./stripe').UserCustomerService & { userIdToCustomerId: Map<string,string> }}
 */
export function createMockUserCustomerService () {
  const userIdToCustomerId = new Map()
  const getUserCustomer = async (userId) => {
    const c = userIdToCustomerId.get(userId)
    if (typeof c === 'string') {
      return { id: c }
    }
    return null
  }
  /**
   * @returns {Promise<void>}
   */
  const upsertUserCustomer = async (userId, customerId) => {
    userIdToCustomerId.set(userId, customerId)
  }
  return {
    userIdToCustomerId,
    getUserCustomer,
    upsertUserCustomer
  }
}

/**
 * @returns {import('src/utils/billing-types.js').CustomersService & { mockCustomers: Array<{ id: string }> }}
 */
export function createMockCustomerService () {
  const mockCustomers = []
  /** @type {Map<string,{ id: string }>} */
  const userIdToCustomer = new Map()
  /**
   * @param {{ id: string }} user
   * @returns {Promise<{ id: string }>}
   */
  async function getOrCreateForUser (user) {
    if (userIdToCustomer.has(user.id)) {
      const customerForUserId = userIdToCustomer.get(user.id)
      if (customerForUserId) {
        return customerForUserId
      }
    }
    const created = { id: `customer-${Math.random().toString().slice(2)}` }
    mockCustomers.push(created)
    userIdToCustomer.set(user.id, created)
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
 * @typedef {object} MockBillingService
 * @property {Array<{ customerId: string, methodId: string }>} paymentMethodSaves
 * @property {Array<{ customerId: string, storageSubscription: any }>} storageSubscriptionSaves
 * @property {import('./billing-types').BillingService['getPaymentMethod']} getPaymentMethod
 * @property {import('./billing-types').BillingService['savePaymentMethod']} savePaymentMethod
 */

/**
 * @returns {MockBillingService}
 */
export function createMockBillingService () {
  const storageSubscriptionSaves = []
  const paymentMethodSaves = []
  /** @type {Map<string,import('./billing-types').PaymentMethod|undefined>} */
  const customerToPaymentMethod = new Map()
  /** @type {MockBillingService} */
  const billing = {
    async getPaymentMethod (customerId) {
      const pm = customerToPaymentMethod.get(customerId)
      return pm ?? null
    },
    async savePaymentMethod (customerId, methodId) {
      paymentMethodSaves.push({ customerId, methodId })
      customerToPaymentMethod.set(customerId, {
        id: methodId
      })
    },
    paymentMethodSaves,
    storageSubscriptionSaves
  }
  return billing
}

/**
 * @returns {import('./billing-types').PaymentMethod}
 */
export function createMockPaymentMethod () {
  return {
    id: `mock_pm_${randomString()}`
  }
}

/**
 * Create a Customers Service for use in testing the app.
 * @returns {import('./billing-types').CustomersService}
 */
function createTestEnvCustomerService () {
  return {
    async getOrCreateForUser (user) {
      // reuse user.id as customer.id
      return { id: user.id }
    }
  }
}

/**
 * Create BillingEnv to use when testing.
 * Use stubs/mocks instead of real billing service (e.g. stripe.com and/or a networked db)
 * @returns {import('./billing-types').BillingEnv}
 */
export function createMockBillingContext () {
  const billing = createMockBillingService()
  const customers = createTestEnvCustomerService()
  return {
    billing,
    customers,
    subscriptions: createMockSubscriptionsService()
  }
}

/**
 * Indicates that a process was not able to find a specific Customer record.
 */
export class CustomerNotFound extends Error {
  /**
   * @param {string} [message]
   * @param {...any} args
   */
  constructor (message = 'customer not found', ...args) {
    super(...[message, ...args])
    this.code = /** @type {const} */ ('ERROR_CUSTOMER_NOT_FOUND')
    void /** @type {import('./billing-types').CustomerNotFound} */ (this)
  }
}

/**
 * @typedef {Parameters<import('./billing-types').SubscriptionsService['saveSubscription']>} SaveSubscriptionCall
 */

/**
 * @returns {import('./billing-types').SubscriptionsService & { saveSubscriptionCalls: SaveSubscriptionCall[] }}
 */
export function createMockSubscriptionsService () {
  /** @type {Map<string, import('./billing-types').W3PlatformSubscription|undefined>} */
  const customerIdToSubscription = new Map()
  /** @type {Array<SaveSubscriptionCall>} */
  const saveSubscriptionCalls = []
  return {
    saveSubscriptionCalls,
    async getSubscription (customerId) {
      const fromMap = customerIdToSubscription.get(customerId)
      const subscription = fromMap ?? {
        storage: null
      }
      return subscription
    },
    async saveSubscription (customerId, subscription) {
      saveSubscriptionCalls.push([customerId, subscription])
      customerIdToSubscription.set(customerId, subscription)
    }
  }
}

/**
 * Create a W3PlatformSubscription that is 'empty' i.e. it has no product-specific subscriptions
 * @returns {import('./billing-types').W3PlatformSubscription}
 */
export function createEmptyW3PlatformSubscription () {
  return {
    storage: null
  }
}

/**
 * @type {Record<StoragePriceName, StoragePriceName>}
 */
export const storagePriceNames = {
  free: /** @type {const} */ ('free'),
  lite: /** @type {const} */ ('lite'),
  pro: /** @type {const} */ ('pro')
}

/**
 * @param {any} name
 * @returns {name is StoragePriceName}
 */
export function isStoragePriceName (name) {
  switch (name) {
    case storagePriceNames.free:
    case storagePriceNames.lite:
    case storagePriceNames.pro:
      return true
  }
  return false
}
