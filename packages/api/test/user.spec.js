/* eslint-env mocha */
import assert from 'assert'
import fetch, { Request } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { getTestJWT, getDBClient } from './scripts/helpers.js'
import userUploads from './fixtures/pgrest/get-user-uploads.js'
import { AuthorizationTestContext } from './contexts/authorization.js'
import { userLoginPost } from '../src/user.js'
import { Magic } from '@magic-sdk/admin'
import { createMockCustomerService, createMockSubscriptionsService, createMockUserCustomerService } from '../src/utils/billing.js'
import { createMagicTestModeToken } from '../src/magic.link.js'
import { createApiMiniflare, useServer, getServerUrl } from './hooks.js'

describe('GET /user/account', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/account', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/account', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('retrieves user account data', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/account', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const data = await res.json()
    assert.strictEqual(data.usedStorage.uploaded, 32000)
    assert.strictEqual(data.usedStorage.psaPinned, 710000)
  })
})

describe('GET /user/info', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/account', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/account', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('retrieves user account data', async function () {
    const db = getDBClient()
    const authorization = AuthorizationTestContext.use(this)
    const token = authorization.createUserToken()
    const user = await db.getUser(authorization.bypass.defaults.issuer, {})
    let res, userInfo

    // Set PSA access to true and check response
    await db.createUserTag(user._id, { tag: 'HasPsaAccess', value: 'true', reason: 'testing' })
    res = await fetch(new URL('user/info', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    userInfo = await res.json()
    assert.strictEqual(userInfo.info._id, user._id)
    assert.strictEqual(userInfo.info.tags.HasPsaAccess, true)

    // Set PSA access to false and check response
    await db.createUserTag(user._id, { tag: 'HasPsaAccess', value: 'false', reason: 'testing' })
    res = await fetch(new URL('user/info', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    userInfo = await res.json()
    assert.strictEqual(userInfo.info._id, user._id)
    assert.strictEqual(userInfo.info.tags.HasPsaAccess, false)
  })
})

describe('GET /user/tokens', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('retrieves user tokens', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/tokens', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const tokens = await res.json()
    assert(Array.isArray(tokens))
    tokens.forEach(t => {
      assert(t._id)
      assert(t.name)
      assert(t.secret)
      assert(t.created)
    })
  })
})

describe('POST /user/tokens', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'test' })
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      body: JSON.stringify({ name: 'test' })
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('creates a new token', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'test' })
    })
    assert(res.ok)
    assert.strictEqual(res.status, 201)
    const { _id } = await res.json()
    assert(_id)
  })

  it('requires valid name', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: null })
    })
    assert(!res.ok)
    const { message } = await res.json()
    assert.strictEqual(message, 'invalid name')
  })
})

describe('DELETE /user/tokens/:id', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens/2', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens/2', endpoint), {
      method: 'DELETE'
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('removes a token', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/tokens/2', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const data = await res.json()
    assert(data._id)
  })
})

describe('GET /user/uploads', () => {
  it('lists uploads', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, userUploads)
  })

  it('lists uploads sorted by name', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?page=1&sortBy=Name', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, [...userUploads].sort((a, b) => b.name.localeCompare(a.name)))
  })

  it('lists uploads sorted by date', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?page=1&sortBy=Date', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, [...userUploads].sort((a, b) => b.created.localeCompare(a.created)))
  })

  it('lists uploads in reverse order when sorting by Asc', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?page=1&sortBy=Name&sortOrder=Asc', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    assert(res.ok)

    const uploads = await res.json()
    const sortedUploads = [...userUploads].sort((a, b) => a.name.localeCompare(b.name))

    assert.deepStrictEqual(uploads, sortedUploads)
  })

  it('filters results by before date', async () => {
    const token = await getTestJWT()

    const beforeFilterDate = new Date('2021-07-10T00:00:00.000000+00:00').toISOString()
    const res = await fetch(new URL(`/user/uploads?before=${beforeFilterDate}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    assert(res.ok)

    const uploads = await res.json()

    assert(uploads.length < userUploads.length, 'Ensure some results are filtered out.')
    assert(uploads.length > 0, 'Ensure some results are returned.')

    // Filter uploads fixture by the filter date.
    const uploadsBeforeFilterDate = userUploads.filter((upload) => {
      return upload.created <= beforeFilterDate
    })

    assert.deepStrictEqual(uploads, [...uploadsBeforeFilterDate])
  })

  it('lists uploads via magic auth', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('/user/uploads', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, userUploads)
  })

  it('paginates by page', async () => {
    const token = await getTestJWT()
    const size = 1
    const page = 2
    const res = await fetch(new URL(`/user/uploads?size=${size}&page=${page}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)

    // Ensure we have all pagination metadata in the headers.
    const link = res.headers.get('link')
    assert(link, 'has a link header for the next page')
    assert.strictEqual(link, `</user/uploads?size=${size}&page=${page + 1}>; rel="next", </user/uploads?size=${size}&page=${Math.ceil(userUploads.length / size)}>; rel="last", </user/uploads?size=${size}&page=1>; rel="first", </user/uploads?size=${size}&page=${page - 1}>; rel="previous"`)

    // Should get second result (page 2).
    const uploads = await res.json()
    const expected = [userUploads[1]]
    assert.deepStrictEqual(uploads, expected)
  })

  it('does not paginate when all results are returned', async () => {
    const token = await getTestJWT()
    const size = 1000
    const res = await fetch(new URL(`/user/uploads?size=${size}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)

    const uploads = await res.json()
    const expected = userUploads
    assert.deepStrictEqual(uploads, expected)
  })
})

describe('GET /user/upload/:cid', () => {
  it('gets a single upload', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL(`/user/uploads/${userUploads[0].cid}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, userUploads[0])
  })

  it('returns 404 when no upload is found', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads/notfound', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 404)
  })
})

describe('DELETE /user/uploads/:cid', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/uploads/bafybeibq5kfbnbvjgjg6bop4anhhaqopkc7t6mp2v3er3fkcv6ezhgvavg', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/uploads/bafybeibq5kfbnbvjgjg6bop4anhhaqopkc7t6mp2v3er3fkcv6ezhgvavg', endpoint), {
      method: 'DELETE'
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('removes an upload', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/uploads/bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const { _id } = await res.json()
    assert(_id)
  })
})

describe('GET /user/pins', () => {
  it('accepts the `size` and `page` options', async () => {
    const size = 1
    const opts = new URLSearchParams({
      page: (1).toString(),
      size: size.toString(),
      status: 'queued,pinning,pinned,failed'
    })
    const token = await getTestJWT('test-pinning', 'test-pinning')
    const res = await fetch(new URL(`user/pins?${opts}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    assert(res.ok)
    const body = (await res.json())
    assert.equal(body.results.length, size)
    assert.equal(res.headers.get('size'), size)
    assert.strictEqual(res.headers.get('link'), '</user/pins?size=1&page=2>; rel="next", </user/pins?size=1&page=8>; rel="last", </user/pins?size=1&page=1>; rel="first"')
  })
  it('returns the correct headers for pagination', async () => {
    const size = 1
    const page = 2
    const opts = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      status: 'queued,pinning,pinned,failed'
    })
    const token = await getTestJWT('test-pinning', 'test-pinning')
    const res = await fetch(new URL(`user/pins?${opts}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    assert(res.ok)
    const body = await res.json()
    assert.equal(body.results.length, size)
    assert.equal(res.headers.get('size'), size)
    assert(res.headers.get('count'))
    assert.equal(res.headers.get('page'), page)
    assert.strictEqual(res.headers.get('link'), '</user/pins?size=1&page=3>; rel="next", </user/pins?size=1&page=8>; rel="last", </user/pins?size=1&page=1>; rel="first", </user/pins?size=1&page=1>; rel="previous"')
  })
  it('returns all pins regardless of the token used', async () => {
    const opts = new URLSearchParams({
      status: 'queued,pinning,pinned,failed'
    })
    const token = await getTestJWT('test-pinning', 'test-pinning')
    const res = await fetch(new URL(`user/pins?${opts}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })

    assert(res.ok)
    const body = await res.json()
    assert.equal(body.count, 8)
  })
})

describe('userLoginPost', function () {
  it('login to email-originating user updates customer contact', async function () {
    const user1Name1 = 'user1+1'
    const user1Authentication1 = {
      issuer: `user1-${Math.random().toString().slice(2)}`,
      publicAddress: `user1-${Math.random().toString().slice(2)}`,
      email: `${user1Name1}@example.com`
    }
    const userCustomerService = createMockUserCustomerService()
    const env = {
      MODE: /** @type {const} */ ('rw'),
      db: getDBClient(),
      magic: new Magic(process.env.MAGIC_SECRET_KEY),
      customers: createMockCustomerService(userCustomerService),
      subscriptions: createMockSubscriptionsService()
    }
    const createUserLoginRequest = () => new Request(new URL('/user/login', endpoint).toString(), {
      method: 'post',
      body: JSON.stringify({
        data: {}
      })
    })

    // create the user
    const { id } = await env.db.upsertUser({ ...user1Authentication1, name: user1Name1 })
    // create the customer for the user
    await env.customers.getOrCreateForUser(
      { id },
      { email: user1Authentication1.email, name: user1Name1 }
    )

    // now we're going to make a userLoginPost request but with a new email
    const name2 = 'user1+2'
    /** @type {import('../src/user.js').IssuedAuthentication} */
    const user1Authentication2 = {
      ...user1Authentication1,
      email: `${name2}@example.com`
    }
    const response2 = await userLoginPost(
      createUserLoginRequest(),
      {
        ...env,
        // now request as same issuer with new email
        authenticateRequest: async () => user1Authentication2
      }
    )
    assert.equal(response2.status, 200, 'response.status is 200')

    // after the second login request (using the user created in the first request)
    // we expect the customer to have been updated with the new email
    const user1Get1 = await env.db.getUser(user1Authentication1.issuer, {})
    const user1Customer = await userCustomerService.getUserCustomer(user1Get1._id)
    assert.ok(user1Customer, 'user1Customer is truthy')
    const user1Get1CustomerContact = await env.customers.getContact(user1Customer.id)
    assert.ok(!(user1Get1CustomerContact instanceof Error), 'user1Get1CustomerContact is not an error')
    assert.equal(user1Get1CustomerContact.email, user1Authentication2.email, 'the customer contact has been updated to user the new email address')
    // this works atm because the user handler will derrive the name from the email address
    assert.equal(user1Get1CustomerContact.name, name2, 'the customer contact has been updated to user the new name')
  })
  it('login to github-originating user updates customer contact', async function () {
    // we're going to create the user by doing userLoginPost the first time
    // then on the second time we'll expect the customer to be updated
    const user1Authentication1 = {
      issuer: `user1-${Math.random().toString().slice(2)}`,
      publicAddress: `user1-${Math.random().toString().slice(2)}`,
      email: 'user1+1@example.com'
    }
    const userCustomerService = createMockUserCustomerService()
    const env = {
      MODE: /** @type {const} */ ('rw'),
      db: getDBClient(),
      magic: new Magic(process.env.MAGIC_SECRET_KEY),
      customers: createMockCustomerService(userCustomerService),
      subscriptions: createMockSubscriptionsService()
    }
    /**
     * @typedef {object} GithubOauthFromMagicLink
     * @property {string} userHandle
     * @property {object} userInfo
     * @property {string} userInfo.name
     * @property {string} [userInfo.picture]
     */
    /**
     * Create a request simulating the end of github authn flow
     * @param {GithubOauthFromMagicLink} oauth
     */
    const createUserLoginViaGithubRequest = (oauth) => new Request(new URL('/user/login', endpoint).toString(), {
      method: 'post',
      body: JSON.stringify({
        type: 'github',
        data: {
          oauth
        }
      })
    })
    /** @type {GithubOauthFromMagicLink} */
    const githubUserOauth1 = {
      userHandle: 'user1',
      userInfo: {
        name: 'User 1'
      }
    }
    // create the user
    const { id } = await env.db.upsertUser({
      ...user1Authentication1,
      name: githubUserOauth1.userInfo.name
    })
    // create the customer for the user
    const customer1 = await env.customers.getOrCreateForUser(
      { id },
      { email: user1Authentication1.email, name: githubUserOauth1.userInfo.name }
    )

    const name2 = {
      emailLocalName: 'user1+2',
      formatted: 'User 1+2'
    }
    /** @type {import('../src/user.js').IssuedAuthentication} */
    const user1Authentication2 = {
      ...user1Authentication1,
      email: `${name2.emailLocalName}@example.com`
    }
    /** @type {GithubOauthFromMagicLink} */
    const githubUserOauth2 = {
      ...githubUserOauth1,
      userInfo: {
        name: name2.formatted
      }
    }
    const response2 = await userLoginPost(
      createUserLoginViaGithubRequest(githubUserOauth2),
      {
        ...env,
        // now request as same issuer with new email
        authenticateRequest: async () => user1Authentication2
      }
    )
    assert.equal(response2.status, 200, 'response.status is 200')

    // make sure the contact was updated after response2
    const contact2 = await env.customers.getContact(customer1.id)
    assert.ok(!(contact2 instanceof Error), 'no error getting contact')
    assert.deepEqual(contact2.email, user1Authentication2.email, 'customer contact has email from authentication after second login')
    assert.deepEqual(contact2.name, githubUserOauth2.userInfo.name, 'customer contact has name from userLoginPost request body after second login')
  })

  it('should not create new users once date is after NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START', async function () {
    if (!process.env.CI_DONT_ACCOMODATE_LONG_TESTS) {
      // this times out on CI in the default 5 seconds.
      // It's not surprising this may take some time, since it relies on creating a whole new miniflare server.
      this.timeout(60 * 1000)
    }
    /**
     * we're going to create a server with the appropriate configuration using miniflare,
     * boot the server, then request POST /user/login and assert about the response.
     */
    const server = await createApiMiniflare({
      bindings: {
        NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START: (new Date(0)).toISOString(),
        NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED: 'true'
      }
    }).startServer()
    await useServer(server, async (server) => {
      const loginEndpoint = new URL('/user/login', getServerUrl(server))
      const user = {
        publicAddress: BigInt(Math.round(Math.random() * Number.MAX_SAFE_INTEGER)),
        claims: {}
      }
      const authToken = createMagicTestModeToken(user.publicAddress, user.claims)
      const userPostLoginResponse = await fetch(loginEndpoint, {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${authToken}`,
          contentType: 'application/json'
        },
        method: 'post',
        body: JSON.stringify({
          email: `test-${Math.random().toString().slice(2)}@example.com`,
          issuer: 'test'
        })
      })
      const responseText = await userPostLoginResponse.text()
      assert.equal(userPostLoginResponse.status, 403, 'response status code is 403 forbidden because new user registration is forbidden')
      assert.ok(responseText.includes('new user registration is closed'), 'response body indicates new user registration is closed')

      const responseJson = JSON.parse(responseText)
      assert.equal(typeof responseJson, 'object', 'response can be parsed as json')
      assert.ok(responseJson.message.includes('new user registration is closed'), 'response object message indicates new user registration is closed')
      assert.equal(responseJson.code, 'NEW_USER_DENIED_TRY_OTHER_PRODUCT')
    })
  })
})
