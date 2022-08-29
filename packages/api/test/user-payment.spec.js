/* eslint-env mocha */
import assert from 'assert'
import fetch, { Request } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { AuthorizationTestContext } from './contexts/authorization.js'
import { StripeBillingService } from '../src/utils/stripe.js'
import { savePaymentSettings } from '../src/utils/billing'

function createBearerAuthorization (bearerToken) {
  return `Bearer ${bearerToken}`
}

function createUserPaymentRequest (arg) {
  const { path, baseUrl, authorization } = {
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
        accept: 'application/json',
        authorization
      }
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
 * @param {BodyInit|undefined|string} arg.body - body of request
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
        authorization
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
    const res = await fetch(createSaveUserPaymentSettingsRequest({ authorization, body: { method: { id: desiredPaymentMethodId } } }))
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
    const paymentSettingsUrl = new URL(res.headers.get('location'), res.url)
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
    const responseFromSaveSettings = await fetch(createSaveUserPaymentSettingsRequest({ authorization, body: { method: { id: desiredPaymentMethodId } } }))
    assert.equal(responseFromSaveSettings.status, 202, 'responseFromSaveSettings.status is 202')
    const responseFromGetSettings = await fetch(createUserPaymentRequest({ authorization }))
    assert.equal(responseFromGetSettings.status, 200, 'responseFromGetSettings.status is 200')
    const payment1 = await responseFromGetSettings.json()
    console.log({ payment1 })
    assert.equal(payment1.method?.id, desiredPaymentMethodId, 'payment1.method.id is desiredPaymentMethodId')
  })
})

describe('StripeBillingService', async function () {
  it('can savePaymentMethod', async function () {
    const paymentMethodId = `pm_w3-test-${Math.random().toString().slice(2)}`
    const billing = StripeBillingService.create()
    await billing.savePaymentMethod({ id: paymentMethodId })
  })
})

describe('savePaymentSettings', async function () {
  it('saves payment method using billingService', async () => {
    const paymentMethodsSaved = []
    const billingService = {
      savePaymentMethod (method) {
        paymentMethodsSaved.push(method)
      }
    }
    const method = { id: 'w3-test-1' }
    await savePaymentSettings({ billingService }, method)
    assert.equal(paymentMethodsSaved.length, 1, 'savePaymentMethod was called once')
    assert.equal(paymentMethodsSaved[0], method, 'savePaymentMethod was called with method')
  })
})
