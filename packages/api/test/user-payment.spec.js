/* eslint-env mocha */
import assert from 'assert'
import fetch, { Request } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { getTestJWT } from './scripts/helpers.js'

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
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(createUserPaymentRequest({ authorization: createBearerAuthorization(token) }))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  // it('error if no auth header', async () => {
  //   const res = await fetch(new URL('user/account', endpoint))
  //   assert(!res.ok)
  //   assert.strictEqual(res.status, 401)
  // })

  // it('retrieves user account data', async () => {
  //   const token = 'test-magic'
  //   const res = await fetch(new URL('user/account', endpoint), {
  //     headers: { Authorization: `Bearer ${token}` }
  //   })
  //   assert(res.ok)
  //   const data = await res.json()
  //   assert.strictEqual(data.usedStorage.uploaded, 32000)
  //   assert.strictEqual(data.usedStorage.psaPinned, 10000)
  // })
})
