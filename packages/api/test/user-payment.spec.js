/* eslint-env mocha */
import assert from 'assert'
import fetch, { Request } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { AuthorizationTestContext } from './contexts/authorization.js'
import { savePaymentSettings } from '../src/utils/billing.js'
import { userPaymentPut } from '../src/user.js'

function createBearerAuthorization (bearerToken) {
  return `Bearer ${bearerToken}`
}

/**
 * @param {object} arg
 * @param {string} [arg.method] - method of request
 * @param {string} [arg.authorization] - authorization header value
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
  return new Request(
    new URL(path, baseUrl),
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
    const savePaymentSettingsResponse = await res.json()
    assert.equal(typeof savePaymentSettingsResponse, 'object')
    assert.ok('method' in savePaymentSettingsResponse, '"method" is in userPaymentSettings.method')
    assert.equal(typeof savePaymentSettingsResponse.method, 'object', 'response.method is an object')
    assert.equal(typeof savePaymentSettingsResponse.method?.id, 'string', 'response.method.id is a string')
    assert.equal(savePaymentSettingsResponse.method?.id, desiredPaymentMethodId, `response.method.id is desiredPaymentMethodId=${desiredPaymentMethodId}`)
    const savedMethodId = savePaymentSettingsResponse.method.id
    assert.equal(typeof res.headers.get('location'), 'string', 'response.headers.location is a string')

    // see if we can then GET the response.headers.location url
    const paymentSettingsUrl = new URL(res.headers.get('location') ?? '', res.url)
    const paymentSettingsResponse = await fetch(paymentSettingsUrl, {
      headers: {
        authorization
      }
    })
    assert.equal(paymentSettingsResponse.status, 200, 'paymentSettingsResponse.status is 200')
    const paymentSettings = await paymentSettingsResponse.json()
    assert.equal(paymentSettings.method.id, savedMethodId, 'paymentSettings.method.id from location header is same as response to PUT')
  })

  it('saves payment method which can then be retrieved via GET', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const authorization = createBearerAuthorization(token)
    const desiredPaymentMethodId = `w3-test-${Math.random().toString().slice(2)}`
    const responseFromSaveSettings = await fetch(createSaveUserPaymentSettingsRequest({ authorization, body: JSON.stringify({ method: { id: desiredPaymentMethodId } }) }))
    assert.equal(responseFromSaveSettings.status, 202, 'responseFromSaveSettings.status is 202')
    const responseFromGetSettings = await fetch(createUserPaymentRequest({ authorization }))
    assert.equal(responseFromGetSettings.status, 200, 'responseFromGetSettings.status is 200')
    // const payment1 = await responseFromGetSettings.json()
    // assert.equal(payment1.method?.id, desiredPaymentMethodId, 'payment1.method.id is desiredPaymentMethodId')
  })
})

describe('userPaymentPut', () => {
  it('saves payment method', async function () {
    const desiredPaymentMethodId = `pm_${randomString()}`
    const paymentSettings = { method: { id: desiredPaymentMethodId } }
    const authorization = createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken())
    const user = { _id: randomString(), issuer: randomString() }
    const request = Object.assign(
      createSaveUserPaymentSettingsRequest({ authorization, body: JSON.stringify(paymentSettings) }),
      { auth: { user } }
    )
    const billing = createMockBillingService()
    const customers = createMockCustomerService()
    const env = {
      billing,
      customers,
      mockStripePaymentMethodId: /** @type const */ (`pm_${randomString()}`)
    }
    const response = await userPaymentPut(request, env)
    assert.equal(response.status, 202, 'response.status is 202')
    assert.equal(billing.paymentMethodSaves.length, 1, 'billing.paymentMethodSaves.length is 1')
    assert.ok(
      customers.mockCustomers.map(c => c.id).includes(billing.paymentMethodSaves[0].customerId),
      'billing.paymentMethodSaves[0].customerId is in customers.mockCustomers')
  })
})

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

/**
 * @returns {import('src/utils/billing-types.js').CustomersService & { mockCustomers: Array<{ id: string }> }}
 */
function createMockCustomerService () {
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

function randomString () {
  return Math.random().toString().slice(2)
}

function createMockBillingService () {
  const paymentMethodSaves = []
  const billing = {
    async savePaymentMethod (customerId, methodId) {
      paymentMethodSaves.push({ customerId, methodId })
    },
    paymentMethodSaves
  }
  return billing
}
