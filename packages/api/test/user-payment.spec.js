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
