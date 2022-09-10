/* eslint-env mocha */
import assert from 'assert'
import fetch, { Request } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { AuthorizationTestContext } from './contexts/authorization.js'
import { createMockBillingService, createMockCustomerService, createMockPaymentMethod, randomString, savePaymentSettings } from '../src/utils/billing.js'
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
  return new Request(
    new URL(path, baseUrl),
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
    const res = await fetch(createSaveUserPaymentSettingsRequest({ authorization, body: JSON.stringify({ method: { id: desiredPaymentMethodId } }) }))
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
  it('saves payment method using billing service', async function () {
    const desiredPaymentMethodId = `pm_${randomString()}`
    const paymentSettings = { method: { id: desiredPaymentMethodId } }
    const authorization = createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken())
    const request = createMockAuthenticatedRequest(createSaveUserPaymentSettingsRequest({ authorization, body: JSON.stringify(paymentSettings) }))
    const billing = createMockBillingService()
    const customers = createMockCustomerService()
    const env = {
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
      billing: createMockBillingService(),
      customers: createMockCustomerService()
    }
    const response = await userPaymentPut(request, env)
    assert.equal(response.status, 202, 'response.status is 202')
    // assert.equal(env.billing.storageSubscriptionSaves.length, 1, 'billing.storageSubscriptionSaves.length is 1')
    // assert.ok(
    //   env.customers.mockCustomers.map(c => c.id).includes(env.billing.storageSubscriptionSaves[0].customerId),
    //   'billing.storageSubscriptionSaves[0].customerId is in customers.mockCustomers')
  })
})

function createMockAuthenticatedRequest (_request) {
  const request = Object.create(_request)
  const user = { _id: randomString(), issuer: randomString() }
  request.auth = { user }
  return request
}

describe('/user/payment', () => {
  it('can userPaymentPut and then userPaymentGet', async function () {
    const env = {
      billing: createMockBillingService(),
      customers: createMockCustomerService()
    }
    const desiredPaymentMethodId = `test_pm_${randomString()}`
    const paymentSettings = { method: { id: desiredPaymentMethodId } }
    const user = { _id: randomString(), issuer: randomString() }
    // save settings
    const savePaymentSettingsRequest = Object.assign(
      createSaveUserPaymentSettingsRequest({ body: JSON.stringify(paymentSettings) }),
      { auth: { user } }
    )
    const savePaymentSettingsResponse = await userPaymentPut(savePaymentSettingsRequest, env)
    assert.equal(savePaymentSettingsResponse.status, 202, 'savePaymentSettingsResponse.status is 202')
    // get settings
    const getPaymentSettingsRequest = Object.assign(
      createUserPaymentRequest(),
      { auth: { user } }
    )
    const getPaymentSettingsResponse = await userPaymentGet(getPaymentSettingsRequest, env)
    assert.equal(getPaymentSettingsResponse.status, 200, 'getPaymentSettingsResponse.status is 200')
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
      billing,
      customers
    })
    const gotPaymentSettings = await response.json()
    assert.equal(gotPaymentSettings.method.id, paymentMethod1.id, 'gotPaymentSettings.method.id is paymentMethod1.id')
  })
  it('returns stripe card info if paymentMethod is a stripe card', async function () {
    const env = {
      customers: createMockCustomerService(),
      billing: {
        ...createMockBillingService(),
        async getPaymentMethod (customer) {
          return createMockStripeCardPaymentMethod()
        }
      }
    }
    const request = createAuthenticatedRequest(createUserPaymentRequest())
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

function createAuthenticatedRequest (baseRequest, auth = { user: { _id: randomString(), issuer: randomString() } }) {
  return {
    ...baseRequest,
    auth
  }
}

describe('savePaymentSettings', async function () {
  it('saves payment method using billingService', async () => {
    const billing = createMockBillingService()
    const method = { id: /** @type const */ ('pm_w3-test-1') }
    const customers = createMockCustomerService()
    const user = { id: randomString() }
    await savePaymentSettings({ billing, customers, user }, { method })
    const { paymentMethodSaves } = billing
    assert.equal(paymentMethodSaves.length, 1, 'savePaymentMethod was called once')
    assert.deepEqual(paymentMethodSaves[0].methodId, method.id, 'savePaymentMethod was called with method')
    assert.equal(typeof paymentMethodSaves[0].customerId, 'string', 'savePaymentMethod was called with method')
  })
})
