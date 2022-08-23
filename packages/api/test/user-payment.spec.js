/* eslint-env mocha */
import assert from 'assert'
import fetch, { Request } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { AuthorizationTestContext } from './contexts/authorization.js'

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
    assert(!res.ok)
  })
  it('error if bad auth header', async () => {
    const createRandomString = () => Math.random().toString().slice(2)
    const authorization = createBearerAuthorization(createRandomString())
    const res = await fetch(createUserPaymentRequest({ authorization }))
    assert(!res.ok)
  })
  it('retrieves user account data', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const authorization = createBearerAuthorization(token)
    const res = await fetch(createUserPaymentRequest({ authorization }))
    assert(res.ok)
    const userPaymentSettings = await res.json()
    assert.equal(typeof userPaymentSettings, 'object')
    assert.ok(!userPaymentSettings.method, 'userPaymentSettings.method is falsy')
  })
})

/**
 * Create a request to SaveUserPaymentSettings
 * @param {object} arg
 * @param {BodyInit|undefined|string} arg.body - body of request
 * @returns
 */
function createSaveUserPaymentSettingsRequest (arg) {
  const { path, baseUrl, authorization, accept, body, method } = {
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
    const res = await fetch(createSaveUserPaymentSettingsRequest({ authorization }))
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
})
