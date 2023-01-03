/* eslint-env mocha */
import assert from 'assert'
import fetch, { Request } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { AuthorizationTestContext } from './contexts/authorization.js'
import { agreements, createMockAgreementService, createMockBillingContext, createMockBillingService, createMockCustomerService, createMockPaymentMethod, createMockSubscriptionsService, getPaymentSettings, randomString, savePaymentSettings, storagePriceNames } from '../src/utils/billing.js'
import { userPaymentGet, userPaymentPut } from '../src/user.js'
import { createMockStripeCardPaymentMethod } from '../src/utils/stripe.js'
import { getDBClient } from './scripts/helpers.js'
import { AgreementsRequiredError } from '../src/errors.js'

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
    assert.ok(!userPaymentSettings.paymentMethod, 'userPaymentSettings.paymentMethod is falsy')
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
      paymentMethod: { id: desiredPaymentMethodId },
      subscription: {
        storage: null
      },
      agreement: 'web3.storage-tos-v1'
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
  it('saves payment method using billing service', async function () {
    const desiredPaymentMethodId = `pm_${randomString()}`
    /** @type {import('src/utils/billing-types.js').PaymentSettings} */
    const paymentSettings = { paymentMethod: { id: desiredPaymentMethodId }, subscription: { storage: null }, agreement: 'web3.storage-tos-v1' }
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
  it('throws an error if no agreement', async function () {
    const desiredPaymentMethodId = `pm_${randomString()}`
    const paymentSettings = { paymentMethod: { id: desiredPaymentMethodId }, subscription: { storage: null } }
    const authorization = createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken())
    const request = createMockAuthenticatedRequest(createSaveUserPaymentSettingsRequest({ authorization, body: JSON.stringify(paymentSettings) }))
    const billing = createMockBillingService()
    const customers = createMockCustomerService()
    const env = {
      ...createMockBillingContext(),
      billing,
      customers
    }
    assert.rejects(
      async () => await userPaymentPut(request, env),
      /Missing Terms of Service/
    )
  })
  it('throws an error if bad agreement', async function () {
    const desiredPaymentMethodId = `pm_${randomString()}`
    const paymentSettings = { paymentMethod: { id: desiredPaymentMethodId }, subscription: { storage: null }, agreement: 'bad-agreement' }
    const authorization = createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken())
    const request = createMockAuthenticatedRequest(createSaveUserPaymentSettingsRequest({ authorization, body: JSON.stringify(paymentSettings) }))
    const billing = createMockBillingService()
    const customers = createMockCustomerService()
    const env = {
      ...createMockBillingContext(),
      billing,
      customers
    }
    assert.rejects(
      async () => await userPaymentPut(request, env),
      /Invalid Terms of Service/
    )
  })
  it('saves storage subscription price', async function () {
    /** @type {import('src/utils/billing-types.js').PaymentSettings} */
    const desiredPaymentSettings = {
      paymentMethod: { id: `pm_${randomString()}` },
      subscription: { storage: { price: storagePriceNames.lite } },
      agreement: 'web3.storage-tos-v1'
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
    try {
      assert.equal(response.status, 202, 'response.status is 202')
    } catch (error) {
      console.log('error with response w/ text: ', await response.text())
      throw error
    }
    assert.equal(env.subscriptions.saveSubscriptionCalls.length, 1, 'subscriptions.saveSubscriptionCalls.length is 1')
    assert.ok(
      env.customers.mockCustomers.map(c => c.id).includes(env.subscriptions.saveSubscriptionCalls[0][0]),
      'saveSubscription was called with a valid customer id')
  })
  it('errors 400 when using a disallowed subscription storage price', async function () {
    /** @type {import('src/utils/billing-types.js').PaymentSettings} */
    const desiredPaymentSettings = {
      paymentMethod: { id: `pm_${randomString()}` },
      subscription: {
        storage: {
          // @ts-ignore
          price: 'disallowed'
        }
      }
    }
    const request = (
      createMockAuthenticatedRequest(
        createSaveUserPaymentSettingsRequest({
          authorization: createBearerAuthorization(AuthorizationTestContext.use(this).createUserToken()),
          body: JSON.stringify(desiredPaymentSettings)
        })))
    const env = {
      ...createMockBillingContext()
    }
    const response = await userPaymentPut(request, env)
    assert.equal(response.status, 400, 'response.status is 400')
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
    const desiredStorageSubscriptionPriceId = storagePriceNames.lite
    /** @type {import('src/utils/billing-types.js').PaymentSettings} */
    const desiredPaymentSettings = {
      paymentMethod: { id: desiredPaymentMethodId },
      subscription: { storage: { price: desiredStorageSubscriptionPriceId } }
    }
    const user = createMockRequestUser()
    // save settings
    const savePaymentSettingsRequest = createMockAuthenticatedRequest(
      createSaveUserPaymentSettingsRequest({ body: JSON.stringify({ ...desiredPaymentSettings, agreement: 'web3.storage-tos-v1' }) }),
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
    assert.equal(gotPaymentSettings.paymentMethod.id, desiredPaymentMethodId, 'gotPaymentSettings.paymentMethod.id is desiredPaymentMethodId')
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
    assert.equal(gotPaymentSettings.paymentMethod.id, paymentMethod1.id, 'gotPaymentSettings.paymentMethod.id is paymentMethod1.id')
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
    assert.equal(typeof gotPaymentSettings.paymentMethod.id, 'string', 'paymentSettings.paymentMethod.id is a string')
    assertIsStripeCard(assert, gotPaymentSettings.paymentMethod.card)
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
    const paymentMethod = { id: /** @type const */ ('pm_w3-test-1') }
    const customers = createMockCustomerService()
    const agreements = createMockAgreementService()
    const user = { id: '1', issuer: randomString() }
    const subscriptions = createMockSubscriptionsService()
    const env = { billing, customers, user, subscriptions, agreements }
    await savePaymentSettings(env, { paymentMethod, subscription: { storage: null }, agreement: undefined })
    const { paymentMethodSaves } = billing
    assert.equal(paymentMethodSaves.length, 1, 'savePaymentMethod was called once')
    assert.deepEqual(paymentMethodSaves[0].methodId, paymentMethod.id, 'savePaymentMethod was called with method')
    assert.equal(typeof paymentMethodSaves[0].customerId, 'string', 'savePaymentMethod was called with method')
  })
  it('saves subscription using billingService', async () => {
    const desiredPaymentSettings = {
      paymentMethod: { id: `pm_mock_${randomString()}` },
      subscription: { storage: { price: storagePriceNames.lite } },
      agreement: agreements.web3StorageTermsOfServiceVersion1
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
  it('saves record of agreement using agreementService', async () => {
    const desiredPaymentSettings = {
      paymentMethod: { id: `pm_mock_${randomString()}` },
      subscription: {
        storage: null
      },
      agreement: agreements.web3StorageTermsOfServiceVersion1
    }
    const createUserAgreementCalls = []
    /** @type {import('src/utils/billing-types.js').AgreementService} */
    const stubbedAgreementsService = {
      async createUserAgreement () {
        createUserAgreementCalls.push(arguments)
      }
    }
    const env = {
      ...createMockBillingContext(),
      agreements: stubbedAgreementsService,
      subscriptions: createMockSubscriptionsService(),
      user: createMockRequestUser()
    }
    await savePaymentSettings(env, desiredPaymentSettings)
    assert.equal(createUserAgreementCalls.length, 1, 'createUserAgreement was called once')
    assert.equal(createUserAgreementCalls[0][0], env.user.id)
    assert.equal(createUserAgreementCalls[0][1], desiredPaymentSettings.agreement)
  })
  it('will not save storage subscription without tos agreement', async () => {
    const desiredPaymentSettings = {
      paymentMethod: { id: `pm_mock_${randomString()}` },
      subscription: { storage: { price: storagePriceNames.lite } },
      agreement: undefined
    }
    const subscriptions = createMockSubscriptionsService()
    const db = getDBClient()
    const env = {
      ...createMockBillingContext(),
      agreements: db,
      subscriptions,
      user: createMockRequestUser()
    }
    let saved = false
    try {
      await savePaymentSettings(env, desiredPaymentSettings)
      saved = true
    } catch (error) {
      assert.ok(error instanceof AgreementsRequiredError, 'error is AgreementRequiredError')
    }
    assert.notEqual(saved, true, 'should not have been able to savePaymentSettings without tos agreement')
    assert.equal(subscriptions.saveSubscriptionCalls.length, 0, 'saveSubscription was not called')
  })
  it('can save with subscription and tos agreement several times', async () => {
    const desiredPaymentSettings = {
      paymentMethod: { id: `pm_mock_${randomString()}` },
      agreement: agreements.web3StorageTermsOfServiceVersion1
    }
    const db = getDBClient()
    const user = await createDbUser(db)
    const env = {
      ...createMockBillingContext(),
      // it's important to use the real db agreement table here
      // because previously a uniqueness constraint
      // here would prevent this test from passing
      agreements: db,
      subscriptions: createMockSubscriptionsService(),
      user
    }
    const storagePriceProgression = [
      storagePriceNames.free,
      storagePriceNames.lite,
      storagePriceNames.pro
    ]
    for (const storagePrice of storagePriceProgression) {
      await savePaymentSettings(env, {
        ...desiredPaymentSettings,
        subscription: { storage: { price: storagePrice } }
      })
    }
  })
  it('can save paymentMethod alone without any agreements', async () => {
    const desiredPaymentSettings = {
      paymentMethod: { id: `pm_mock_${randomString()}` },
      subscription: {
        storage: null
      },
      agreement: undefined
    }
    const db = getDBClient()
    const user = await createDbUser(db)
    const env = {
      ...createMockBillingContext(),
      agreements: db,
      subscriptions: createMockSubscriptionsService(),
      user
    }
    await savePaymentSettings(env, desiredPaymentSettings)
  })
  it('can save storage subscription, then update only the default payment method', async () => {
    const initialPaymentSettings = {
      paymentMethod: { id: `pm_mock_${randomString()}` },
      subscription: {
        storage: { price: storagePriceNames.lite }
      },
      agreement: agreements.web3StorageTermsOfServiceVersion1
    }
    const paymentMethodUpdate = {
      paymentMethod: { id: `pm_mock_${randomString()}` }
    }
    const db = getDBClient()
    const user = await createDbUser(db)
    const env = {
      ...createMockBillingContext(),
      agreements: db,
      subscriptions: createMockSubscriptionsService(),
      user
    }
    await savePaymentSettings(env, initialPaymentSettings)
    await savePaymentSettings(env, paymentMethodUpdate)
    const paymentSettingsAfterUpdate = await getPaymentSettings(env)
    assert.ok(!(paymentSettingsAfterUpdate instanceof Error), 'should not have gotten an error')
    assert.equal(paymentSettingsAfterUpdate.paymentMethod?.id, paymentMethodUpdate.paymentMethod.id)
    assert.equal(paymentSettingsAfterUpdate.subscription.storage?.price, initialPaymentSettings.subscription.storage.price)
  })
})

/**
 * Create a user in the db with random info
 * @param {import('@web3-storage/db').DBClient} db
 */
async function createDbUser (db) {
  return await db.upsertUser({
    issuer: randomString(),
    name: randomString(),
    email: `${randomString()}@example.com`,
    publicAddress: randomString()
  })
}
