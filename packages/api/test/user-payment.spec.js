/* eslint-env mocha */
import assert from 'assert'
import fetch, { Request } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { AuthorizationTestContext } from './contexts/authorization.js'
import { createMockBillingContext, createMockBillingService, createMockCustomerService, createMockPaymentMethod, createMockSubscriptionsService, randomString, savePaymentSettings } from '../src/utils/billing.js'
import { userPaymentGet, userPaymentPut } from '../src/user.js'
import { createMockStripeCardPaymentMethod } from '../src/utils/stripe.js'

function createBearerAuthorization (bearerToken) {
  return `Bearer ${bearerToken}`
}

/**
 * @param {object} arg
 * @param {string} [arg.method] - method of request
 * @param {string} [arg.authorization] - authorization header value
 * @param {Record<string,string>} [arg.searchParams]
 */
function createUserPaymentRequest (arg = {}) {
  const { path, baseUrl, authorization, accept, method } = {
    authorization: undefined,
    path: '/user/payment',
    baseUrl: endpoint,
    accept: 'application/json',
    method: 'get',
    ...arg
  }
  const url = new URL(path, baseUrl)
  for (const [key, value] of Object.entries(arg.searchParams || {})) {
    url.searchParams.set(key, value)
  }
  return new Request(
    url,
    {
      headers: {
        accept,
        ...(authorization ? { authorization } : {})
      },
      method
    }
  )
}

describe('GET /user/payment', () => {
  it('error if no auth header', async () => {
    const res = await fetch(createUserPaymentRequest())
    assert(!res.ok, 'response is not ok without proof of authorization')
  })
  it('error if bad auth header', async () => {
    const createRandomString = () => Math.random().toString().slice(2)
    const authorization = createBearerAuthorization(createRandomString())
    const res = await fetch(createUserPaymentRequest({ authorization }))
    assert(!res.ok)
  })
  it('retrieves user payment settings', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const authorization = createBearerAuthorization(token)
    const res = await fetch(createUserPaymentRequest({ authorization }))
    assert.equal(res.status, 200, 'response.status is 200')
    assert(res.ok, 'response status is ok')
    const userPaymentSettings = await res.json()
    assert.equal(typeof userPaymentSettings, 'object')
    assert.ok(!userPaymentSettings.method, 'userPaymentSettings.method is falsy')
  })
  it('supports ?mockSubscription=true', async function () {
    const request = createUserPaymentRequest({
      authorization: createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken()),
      searchParams: {
        mockSubscription: 'true'
      }
    })
    const response = await fetch(request)
    assert.equal(response.status, 200, 'response.status is 200')
    const paymentSettings = await response.json()
    assert.equal(typeof paymentSettings?.subscription?.storage?.price, 'string', 'paymentSettings.subscription.storage.price is a string')
  })
})

/**
 * Create a request to SaveUserPaymentSettings
 * @param {object} [arg]
 * @param {BodyInit|undefined|string} [arg.body] - body of request
 * @param {string} [arg.authorization] - authorization header value
 * @param {Record<string,any>} [arg.searchParams] - query string searchParams
 * @returns
 */
function createSaveUserPaymentSettingsRequest (arg = {}) {
  const body = (typeof arg.body === 'object') ? JSON.stringify(arg.body) : arg.body
  const { path, baseUrl, authorization, accept, method } = {
    authorization: undefined,
    path: '/user/payment',
    baseUrl: endpoint,
    accept: 'application/json',
    method: 'put',
    ...arg
  }
  const requestUrl = new URL(path, baseUrl)
  for (const [key, value] of Object.entries(arg.searchParams || {})) {
    requestUrl.searchParams.set(key, value)
  }
  return new Request(
    requestUrl,
    {
      method,
      body,
      headers: {
        accept,
        ...(authorization ? { authorization } : {})
      }
    }
  )
}

describe('PUT /user/payment', () => {
  it('error if no auth header', async () => {
    const res = await fetch(createSaveUserPaymentSettingsRequest())
    assert(!res.ok)
  })
  it('error if bad auth header', async () => {
    const createRandomString = () => Math.random().toString().slice(2)
    const authorization = createBearerAuthorization(createRandomString())
    const res = await fetch(createSaveUserPaymentSettingsRequest({ authorization }))
    assert(!res.ok)
  })
  it('saves user payment settings', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const authorization = createBearerAuthorization(token)
    const desiredPaymentMethodId = `w3-test-${Math.random().toString().slice(2)}`
    /** @type {import('src/utils/billing-types.js').PaymentSettings} */
    const desiredPaymentSettings = {
      method: { id: desiredPaymentMethodId },
      subscription: {
        storage: null
      }
    }
    const res = await fetch(createSaveUserPaymentSettingsRequest({ authorization, body: JSON.stringify(desiredPaymentSettings) }))
    try {
      assert.equal(res.status, 202, 'response.status is 202')
    } catch (error) {
      console.log('response text is', await res.text())
      throw error
    }
    assert.equal(typeof res.headers.get('location'), 'string', 'response.headers.location is a string')
  })
})

describe('userPaymentPut', () => {
  it('if dangerouslyDefaultSubscription, can have missing subscription and its treated as a default nully one', async function () {
    /** @type {Omit<import('src/utils/billing-types.js').PaymentSettings, 'subscription'>} */
    const desiredPaymentSettings = { method: { id: `pm_${randomString()}` } }
    const authorization = createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken())
    const env = {
      ...createMockBillingContext(),
      subscriptions: createMockSubscriptionsService()
    }
    const request = createMockAuthenticatedRequest(
      createSaveUserPaymentSettingsRequest({
        authorization,
        body: JSON.stringify(desiredPaymentSettings),
        searchParams: {
          dangerouslyDefaultSubscription: 'true'
        }
      })
    )
    const response = await userPaymentPut(request, env)
    assert.equal(response.status, 202, 'response.status is 202')
  })
  it('saves payment method using billing service', async function () {
    const desiredPaymentMethodId = `pm_${randomString()}`
    /** @type {import('src/utils/billing-types.js').PaymentSettings} */
    const paymentSettings = { method: { id: desiredPaymentMethodId }, subscription: { storage: null } }
    const authorization = createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken())
    const request = createMockAuthenticatedRequest(createSaveUserPaymentSettingsRequest({ authorization, body: JSON.stringify(paymentSettings) }))
    const billing = createMockBillingService()
    const customers = createMockCustomerService()
    const env = {
      ...createMockBillingContext(),
      billing,
      customers
    }
    const response = await userPaymentPut(request, env)
    assert.equal(response.status, 202, 'response.status is 202')
    assert.equal(billing.paymentMethodSaves.length, 1, 'billing.paymentMethodSaves.length is 1')
    assert.ok(
      customers.mockCustomers.map(c => c.id).includes(billing.paymentMethodSaves[0].customerId),
      'billing.paymentMethodSaves[0].customerId is in customers.mockCustomers')
  })
  it('saves storage subscription price', async function () {
    const desiredPaymentSettings = {
      method: { id: `pm_${randomString()}` },
      subscription: { storage: { price: `price_test_${randomString()}` } }
    }
    const request = (
      createMockAuthenticatedRequest(
        createSaveUserPaymentSettingsRequest({
          authorization: createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken()),
          body: JSON.stringify(desiredPaymentSettings)
        })))
    const env = {
      ...createMockBillingContext(),
      subscriptions: createMockSubscriptionsService(),
      billing: createMockBillingService(),
      customers: createMockCustomerService()
    }
    const response = await userPaymentPut(request, env)
    assert.equal(response.status, 202, 'response.status is 202')
    assert.equal(env.subscriptions.saveSubscriptionCalls.length, 1, 'subscriptions.saveSubscriptionCalls.length is 1')
    assert.ok(
      env.customers.mockCustomers.map(c => c.id).includes(env.subscriptions.saveSubscriptionCalls[0][0]),
      'saveSubscription was called with a valid customer id')
  })
})

/**
 * Create a mock user that can go on an AuthenticatedRequest
 * @returns
 */
function createMockRequestUser () {
  const userId = randomString()
  const user = { id: userId, _id: userId, issuer: userId }
  return user
}

/**
 * @param {Request} _request
 */
function createMockAuthenticatedRequest (_request, user = createMockRequestUser()) {
  /** @type {import('../src/user.js').AuthenticatedRequest} */
  const request = Object.create(_request)
  request.auth = { user }
  return request
}

describe('/user/payment', () => {
  it('can userPaymentPut and then userPaymentGet the saved payment settings', async function () {
    const env = {
      ...createMockBillingContext(),
      billing: createMockBillingService(),
      customers: createMockCustomerService()
    }
    const desiredPaymentMethodId = `test_pm_${randomString()}`
    const desiredStorageSubscriptionPriceId = `price_storage_mock_${randomString()}`
    const desiredPaymentSettings = {
      method: { id: desiredPaymentMethodId },
      subscription: { storage: { price: desiredStorageSubscriptionPriceId } }
    }
    const user = createMockRequestUser()
    // save settings
    const savePaymentSettingsRequest = createMockAuthenticatedRequest(
      createSaveUserPaymentSettingsRequest({ body: JSON.stringify(desiredPaymentSettings) }),
      user
    )
    const savePaymentSettingsResponse = await userPaymentPut(savePaymentSettingsRequest, env)
    assert.equal(savePaymentSettingsResponse.status, 202, 'savePaymentSettingsResponse.status is 202')
    // get settings
    const getPaymentSettingsRequest = createMockAuthenticatedRequest(
      createUserPaymentRequest(),
      user
    )
    const getPaymentSettingsResponse = await userPaymentGet(getPaymentSettingsRequest, env)
    assert.equal(getPaymentSettingsResponse.status, 200, 'getPaymentSettingsResponse.status is 200')
    const gotPaymentSettings = await getPaymentSettingsResponse.json()
    assert.equal(gotPaymentSettings.method.id, desiredPaymentMethodId, 'gotPaymentSettings.method.id is desiredPaymentMethodId')
    assert.deepEqual(gotPaymentSettings, desiredPaymentSettings, 'gotPaymentSettings is desiredPaymentSettings')
  })
})

describe('userPaymentGet', () => {
  it('gets payment method using billing service', async function () {
    const user = { _id: randomString(), issuer: randomString() }
    const authorization = createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken())
    const request = Object.assign(
      createUserPaymentRequest({ authorization }),
      { auth: { user } }
    )
    const paymentMethod1 = createMockPaymentMethod()
    /** @type {import('src/utils/billing-types.js').BillingService} */
    const billing = {
      ...createMockBillingService(),
      async getPaymentMethod (customer) {
        return paymentMethod1
      }
    }
    const customers = createMockCustomerService()
    const response = await userPaymentGet(request, {
      ...createMockBillingContext(),
      billing,
      customers
    })
    const gotPaymentSettings = await response.json()
    assert.equal(gotPaymentSettings.method.id, paymentMethod1.id, 'gotPaymentSettings.method.id is paymentMethod1.id')
  })
  it('returns stripe card info if paymentMethod is a stripe card', async function () {
    const env = {
      ...createMockBillingContext(),
      customers: createMockCustomerService(),
      billing: {
        ...createMockBillingService(),
        async getPaymentMethod (customer) {
          return createMockStripeCardPaymentMethod()
        }
      }
    }
    const request = createMockAuthenticatedRequest(createUserPaymentRequest())
    const response = await userPaymentGet(request, env)
    assert.equal(response.ok, true, 'response is ok')
    const gotPaymentSettings = await response.json()
    assert.equal(typeof gotPaymentSettings.method.id, 'string', 'paymentSettings.method.id is a string')
    assertIsStripeCard(assert, gotPaymentSettings.method.card)
  })
})

function assertIsStripeCard (_assert, card) {
  _assert.equal(card['@type'], 'https://stripe.com/docs/api/cards/object', 'card["@type"] is https://stripe.com/docs/api/cards/object')
  _assert.equal(typeof card.brand, 'string', 'card.brand is a string')
  _assert.equal(typeof card.last4, 'string', 'card.last4 is a string')
  _assert.equal(typeof card.exp_month, 'number', 'card.expMonth is a number')
  _assert.equal(typeof card.exp_year, 'number', 'card.expYear is a number')
}

describe('savePaymentSettings', async function () {
  it('saves payment method using billingService', async () => {
    const billing = createMockBillingService()
    const method = { id: /** @type const */ ('pm_w3-test-1') }
    const customers = createMockCustomerService()
    const user = { id: randomString() }
    const subscriptions = createMockSubscriptionsService()
    const env = { billing, customers, user, subscriptions }
    await savePaymentSettings(env, { method, subscription: { storage: null } })
    const { paymentMethodSaves } = billing
    assert.equal(paymentMethodSaves.length, 1, 'savePaymentMethod was called once')
    assert.deepEqual(paymentMethodSaves[0].methodId, method.id, 'savePaymentMethod was called with method')
    assert.equal(typeof paymentMethodSaves[0].customerId, 'string', 'savePaymentMethod was called with method')
  })
  it('saves subscription using billingService', async () => {
    const desiredPaymentSettings = {
      method: { id: `pm_mock_${randomString()}` },
      subscription: { storage: { price: `price_storage_mock_${randomString()}` } }
    }
    const subscriptions = createMockSubscriptionsService()
    const env = {
      ...createMockBillingContext(),
      subscriptions,
      user: createMockRequestUser()
    }
    await savePaymentSettings(env, desiredPaymentSettings)
    assert.equal(subscriptions.saveSubscriptionCalls.length, 1, 'saveSubscription was called once')
  })
})
