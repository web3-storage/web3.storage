/* eslint-disable no-void */

import { AgreementsRequiredError } from '../../src/errors.js'

/**
 * @typedef {import('./billing-types').StoragePriceName} StoragePriceName
 */

/** @type {Record<string, import('./billing-types').Agreement>} */
export const agreements = {
  web3StorageTermsOfServiceVersion1: /** @type {const} */('web3.storage-tos-v1')
}

/**
 * Type guard whether provided value is a valid Agreement kind
 * @param {any} maybeAgreement
 * @returns {agreement is import('./billing-types').Agreement}
 */
export function isAgreement (maybeAgreement) {
  for (const agreement of Object.values(agreements)) {
    if (maybeAgreement === agreement) {
      return true
    }
  }
  return false
}

/**
 * Given a W3PlatformSubscription, return the agreements that are required to subscribe to it.
 * e.g. a priced storage subscription requires signing a terms of service agreement
 * @param {import('./billing-types').W3PlatformSubscription} subscription
 * @returns {Set<import('./billing-types').Agreement>}
 */
function getRequiredAgreementsForSubscription (subscription) {
  /** @type {Set<import('./billing-types').Agreement>} */
  const requiredAgreements = new Set([])
  if (subscription.storage !== null) {
    requiredAgreements.add(agreements.web3StorageTermsOfServiceVersion1)
  }
  return requiredAgreements
}

/**
 * @param {import('./billing-types').W3PlatformSubscription} subscription
 * @param {Set<import('./billing-types').Agreement>} agreements
 * @returns {Set<import('./billing-types').Agreement>}
 */
function getMissingRequiredSubscriptionAgreements (
  subscription,
  agreements
) {
  /** @type {Set<import('./billing-types').Agreement>} */
  const missing = new Set()
  for (const requiredAgreement of getRequiredAgreementsForSubscription(subscription)) {
    if (!agreements.has(requiredAgreement)) {
      missing.add(requiredAgreement)
    }
  }
  return missing
}

/**
 * Save a user's payment settings
 * @param {object} ctx
 * @param {import('./billing-types').BillingService} ctx.billing
 * @param {import('./billing-types').CustomersService} ctx.customers
 * @param {import('./billing-types').SubscriptionsService} ctx.subscriptions
 * @param {import('./billing-types').AgreementService} ctx.agreements
 * @param {import('./billing-types').BillingUser} ctx.user
 * @param {import('./billing-types').SavePaymentSettingsCommand} command
 * @param {import('./billing-types').UserCreationOptions} [userCreationOptions]
 */
export async function savePaymentSettings (ctx, command, userCreationOptions) {
  const { billing, customers, user, agreements } = ctx
  const updatedSubscription = hasOwnProperty(command, 'subscription') ? command.subscription : undefined
  const commandAgreement = hasOwnProperty(command, 'agreement') ? command.agreement : undefined
  // if updating subscription, check for required agreements
  if (updatedSubscription) {
    const agreementsFromSettings = new Set()
    if (commandAgreement) { agreementsFromSettings.add(commandAgreement) }
    const missingAgreements = getMissingRequiredSubscriptionAgreements(updatedSubscription, agreementsFromSettings)
    if (missingAgreements.size > 0) {
      throw new AgreementsRequiredError(Array.from(missingAgreements))
    }
  }
  const customer = await customers.getOrCreateForUser(user, userCreationOptions)
  if (commandAgreement) {
    await agreements.createUserAgreement(user.id, commandAgreement)
  }
  await billing.savePaymentMethod(customer.id, command.paymentMethod.id)
  if (updatedSubscription) {
    await ctx.subscriptions.saveSubscription(customer.id, updatedSubscription)
  }
}

/**
 * Object.hasOwnProperty as typescript type guard
 * @template {unknown} X
 * @template {PropertyKey} Y
 * @param {X} obj
 * @param {Y} prop
 * @returns {obj is X & Record<Y, unknown>}
 * https://fettblog.eu/typescript-hasownproperty/
 */
export function hasOwnProperty (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
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
    paymentMethod,
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
 * @param {import('src/utils/billing-types.js').UserCustomerService} userCustomerService
 * @param {Map<string,{
 *  contact: import('src/utils/billing-types.js').CustomerContact,
 * }>} customerIdMap
 * @returns {import('src/utils/billing-types.js').CustomersService & { mockCustomers: Array<{ id: string }> }}
 */
export function createMockCustomerService (
  userCustomerService = createMockUserCustomerService(),
  customerIdMap = new Map()
) {
  const mockCustomers = []
  /**
   * @type {import('src/utils/billing-types.js').CustomersService['getForUser']}
   */
  async function getForUser (user) {
    const existingCustomerForUser = await userCustomerService.getUserCustomer(user.id)
    if (existingCustomerForUser) {
      return { id: existingCustomerForUser.id }
    }

    return null
  }
  /**
   * @type {import('src/utils/billing-types.js').CustomersService['getOrCreateForUser']}
   */
  async function getOrCreateForUser (user, creationOptions) {
    const existingCustomerForUser = await userCustomerService.getUserCustomer(user.id)
    if (existingCustomerForUser) {
      return { id: existingCustomerForUser.id }
    }
    const createdCustomer = {
      id: `customer-${Math.random().toString().slice(2)}`,
      email: creationOptions?.email,
      name: creationOptions?.name
    }
    mockCustomers.push(createdCustomer)
    customerIdMap.set(createdCustomer.id, {
      contact: {
        email: creationOptions?.email,
        name: creationOptions?.name
      }
    })
    await userCustomerService.upsertUserCustomer(user.id, createdCustomer.id)
    return createdCustomer
  }
  /** @type {import('./billing-types').CustomersService['getContact']} */
  async function getContact (customerId) {
    const customerFromMap = customerIdMap.get(customerId)
    if (!customerFromMap) {
      return new CustomerNotFound()
    }
    return customerFromMap.contact
  }
  /** @type {import('./billing-types').CustomersService['updateContact']} */
  async function updateContact (customerId, contact) {
    const prev = customerIdMap.get(customerId)
    const next = { ...prev, contact }
    customerIdMap.set(customerId, next)
  }
  return {
    getContact,
    getOrCreateForUser,
    getForUser,
    updateContact,
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
  return createMockCustomerService()
}

/**
 * Create a AgreementService for use in testing the app.
 * @returns {import('./billing-types').AgreementService}
 */
export function createMockAgreementService () {
  return {
    async createUserAgreement (userId, agreement) {}
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
  const agreements = createMockAgreementService()
  return {
    agreements,
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
