import * as JWT from './utils/jwt.js'
import { JSONResponse, notFound } from './utils/json-response.js'
import { JWT_ISSUER } from './constants.js'
import { HTTPError, PSAErrorInvalidData, PSAErrorRequiredData, PSAErrorResourceNotFound, RangeNotSatisfiableError, NewUserDeniedTryOtherProductError } from './errors.js'
import { getTagValue, hasPendingTagProposal, hasTag } from './utils/tags.js'
import {
  NO_READ_OR_WRITE,
  READ_WRITE,
  READ_ONLY,
  maintenanceHandler
} from './maintenance.js'
import { pagination } from './utils/pagination.js'
import { toPinStatusResponse } from './pins.js'
import { INVALID_REQUEST_ID, REQUIRED_REQUEST_ID, validateSearchParams } from './utils/psa.js'
import { magicLinkBypassForE2ETestingInTestmode } from './magic.link.js'
import { CustomerNotFound, getPaymentSettings, isStoragePriceName, savePaymentSettings } from './utils/billing.js'
import * as w3upLaunch from '@web3-storage/w3up-launch'

/**
 * @typedef {string} UserId
 * @typedef {{ _id: UserId, issuer: string, name?: string, email?: string }} User
 * @typedef {{ _id: string, name: string }} AuthToken
 * @typedef {{ user: User, authToken?: AuthToken }} Auth
 * @typedef {Request & { auth: Auth }} AuthenticatedRequest
 * @typedef {import('@web3-storage/db').PageRequest} PageRequest
 */

/**
 * @typedef {object} IssuedAuthentication
 * @property {string} issuer
 * @property {string} publicAddress
 * @property {string} [email]
 */

/**
 * @typedef {(req: Request) => Promise<null|IssuedAuthentication>} RequestAuthenticator
 */

/**
 * Context needed to perform new user registration
 * @typedef {object} UserRegistrationContext
 * @property {object} magic
 * @property {object} magic.utils
 * @property {import('./env').Env['magic']['utils']['parseAuthorizationHeader']} magic.utils.parseAuthorizationHeader
 * @property {import('./env').Env['MODE']} MODE
 * @property {object} db
 * @property {import('./env').Env['db']['upsertUser']} db.upsertUser
 * @property {import('./env').Env['db']['getUser']} db.getUser
 * @property {import('./env').Env['NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START']} [NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START]
 * @property {import('./env').Env['NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START']} [NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START]
 * @property {import('./env').Env['NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START']} [NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START]
 * @property {RequestAuthenticator} authenticateRequest
 * @property {import('../src/utils/billing-types').CustomersService} customers
 * @property {import('../src/utils/billing-types').SubscriptionsService} subscriptions
 */

/**
 * @param {Request} request
 * @param {UserRegistrationContext} env
 * @returns {Promise<Response>}
 */
export async function userLoginPost (request, env) {
  const user = await loginOrRegister(request, env)
  return new JSONResponse({ issuer: user.issuer })
}

/**
 * Controller for logging in using a magic.link token
 */
function createMagicLoginController (env, testModeBypass = magicLinkBypassForE2ETestingInTestmode) {
  const createTestmodeMetadata = (token) => {
    const { issuer, publicAddress, email } = testModeBypass.authenticateMagicToken(env, token)
    return {
      issuer,
      email: email || 'testMode@magic.link',
      publicAddress: publicAddress || issuer
    }
  }
  /**
   * authenticate an incoming request that has a magic.link token.
   * throws error if token isnt valid
   * @returns {Promise} metadata about the validated token
   */
  const authenticate = async ({ token }) => {
    if (testModeBypass.isEnabledForToken(env, token)) {
      return createTestmodeMetadata(token)
    }
    await env.magic.token.validate(token)
    return env.magic.users.getMetadataByToken(token)
  }
  return {
    authenticate
  }
}

/**
 * @param {UserRegistrationContext} env
 * @returns {RequestAuthenticator}
 */
const createMagicLinkRequestAuthenticator = (env) => async (request) => {
  const auth = request.headers.get('Authorization') || ''
  const token = env.magic.utils.parseAuthorizationHeader(auth)
  const metadata = await (createMagicLoginController(env).authenticate({ token }))
  /** @type {IssuedAuthentication} */
  const authentication = {
    ...metadata,
    issuer: metadata.issuer,
    publicAddress: metadata.publicAddress
  }
  return authentication
}

/**
 * @param {Request} request
 * @param {UserRegistrationContext} env
 * @returns {Promise<{ issuer: string }>}
 */
async function loginOrRegister (request, env) {
  const data = await request.json()
  const authenticateRequest = env.authenticateRequest || createMagicLinkRequestAuthenticator(env)
  const metadata = await authenticateRequest(request)
  if (!metadata) {
    throw new Error('unable to authenticate request')
  }
  const { issuer, email, publicAddress } = metadata
  if (!issuer || !email || !publicAddress) {
    throw new Error('missing required metadata')
  }

  const parsed =
    data.type === 'github'
      ? parseGitHub(data.data, metadata)
      : parseMagic(metadata)

  const newUserRegistrationIsClosed = w3upLaunch.shouldBlockNewUserSignupsBecauseProductSunset(w3upLaunch.W3upLaunch.fromEnv(env))

  let user

  // will be true once w3up is launched and this product is sunset
  if (newUserRegistrationIsClosed) {
    const user = await env.db.getUser(parsed.issuer, {})
    if (!user) {
      const otherProduct = new URL('https://console.web3.storage/')
      throw new NewUserDeniedTryOtherProductError(`new user registration is closed. Try creating an account at ${otherProduct.toString()}`, otherProduct)
    }
  }

  // check if maintenance mode
  if (env.MODE === NO_READ_OR_WRITE) {
    return maintenanceHandler()
  } else if (env.MODE === READ_WRITE) {
    if (newUserRegistrationIsClosed) {
      // dont upsert even though MODE allows, because we dont want to insert new users
      user = user || await env.db.getUser(parsed.issuer, {})
    } else {
      user = await env.db.upsertUser(parsed)
      if (!user.inserted) {
        await updateUserCustomerContact(env, user, parsed)
      }
    }
  } else if (env.MODE === READ_ONLY) {
    user = user || await env.db.getUser(parsed.issuer, {})
  } else {
    throw new Error(`Unknown maintenance mode ${env.MODE}`)
  }

  return user
}

/**
 * @param {object} context
 * @param {import('../src/utils/billing-types').CustomersService} context.customers
 * @param {Pick<import('../src/utils/billing-types').BillingUser, 'id'>} user
 * @param {import('../src/utils/billing-types').CustomerContact} contact
 */
async function updateUserCustomerContact (context, user, contact) {
  const customer = await context.customers.getForUser(user)

  if (customer) {
    await context.customers.updateContact(customer.id, contact)
  }
}

/**
 * @param {import('@magic-ext/oauth').OAuthRedirectResult} data
 * @param {IssuedAuthentication} magicMetadata
 * @returns {import('@web3-storage/db/db-client-types').UpsertUserInput}
 */
function parseGitHub ({ oauth }, { issuer, email, publicAddress }) {
  return {
    name: oauth.userInfo.name || '',
    picture: oauth.userInfo.picture || '',
    issuer: issuer ?? '',
    email: email ?? '',
    github: oauth.userHandle,
    publicAddress
  }
}

/**
 * @param {IssuedAuthentication} magicMetadata
 * @returns {import('@web3-storage/db/db-client-types').UpsertUserInput}
 */
function parseMagic ({ issuer, email, publicAddress }) {
  const name = email?.split('@')[0]
  return {
    name: name ?? '',
    issuer,
    email: email ?? '',
    publicAddress
  }
}

/**
 * Create a new auth key.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @returns {Promise<Response>}
 */
export async function userTokensPost (request, env) {
  const { name } = await request.json()
  if (!name || typeof name !== 'string') {
    throw Object.assign(new Error('invalid name'), { status: 400 })
  }

  const { _id, issuer } = request.auth.user
  const sub = issuer
  const iss = JWT_ISSUER
  const secret = await JWT.sign({ sub, iss, iat: Date.now(), name }, env.SALT)

  const key = await env.db.createKey({
    // @ts-ignore
    user: _id,
    name,
    secret
  })

  return new JSONResponse(key, { status: 201 })
}

/**
 * Retrieve user account data.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userAccountGet (request, env) {
  const [usedStorage, storageLimitBytes] = await Promise.all([
    // @ts-ignore user used storage object
    env.db.getStorageUsed(request.auth.user._id),
    // @ts-ignore
    env.db.getUserTagValue(request.auth.user._id, 'StorageLimitBytes')
  ])
  return new JSONResponse({
    usedStorage,
    storageLimitBytes
  })
}

/**
 * Retrieve user info
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userInfoGet (request, env) {
  const user = await env.db.getUser(request.auth.user.issuer, {
    includeTags: true,
    // @ts-ignore
    includeTagProposals: true
  })

  return new JSONResponse({
    info: {
      ...user,
      tags: {
        HasAccountRestriction: hasTag(user, 'HasAccountRestriction', 'true'),
        HasDeleteRestriction: hasTag(user, 'HasDeleteRestriction', 'true'),
        HasPsaAccess: hasTag(user, 'HasPsaAccess', 'true'),
        HasSuperHotAccess: hasTag(user, 'HasSuperHotAccess', 'true'),
        StorageLimitBytes: getTagValue(user, 'StorageLimitBytes', '')
      },
      tagProposals: {
        HasAccountRestriction: hasPendingTagProposal(user, 'HasAccountRestriction'),
        HasDeleteRestriction: hasPendingTagProposal(user, 'HasDeleteRestriction'),
        HasPsaAccess: hasPendingTagProposal(user, 'HasPsaAccess'),
        HasSuperHotAccess: hasPendingTagProposal(user, 'HasSuperHotAccess'),
        StorageLimitBytes: hasPendingTagProposal(user, 'StorageLimitBytes')
      }
    }
  })
}

/**
 * Post a new user request.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userRequestPost (request, env) {
  const user = request.auth.user
  const { tagName, requestedTagValue, userProposalForm } = await request.json()
  // @ts-ignore
  const res = await env.db.createUserRequest(
    user._id,
    tagName,
    requestedTagValue,
    userProposalForm
  )

  try {
    notifySlack(user, tagName, requestedTagValue, userProposalForm, env)
  } catch (e) {
    console.error('Failed to notify Slack: ', e)
  }

  return new JSONResponse(res)
}

/**
 * Retrieve user auth tokens.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userTokensGet (request, env) {
  const tokens = await env.db.listKeys(request.auth.user._id)

  return new JSONResponse(tokens)
}

/**
 * Delete a user auth token. This actually raises a tombstone rather than
 * deleting it entirely.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userTokensDelete (request, env) {
  // @ts-ignore
  const res = await env.db.deleteKey(request.auth.user._id, request.params.id)
  return new JSONResponse(res)
}

/**
 * Retrieve a page of user uploads.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userUploadsGet (request, env) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl

  const pageRequest = pagination(searchParams)

  let data
  try {
    // @ts-ignore
    data = await env.db.listUploads(request.auth.user._id, pageRequest)
  } catch (err) {
    // @ts-ignore
    if (err.code === 'RANGE_NOT_SATISFIABLE_ERROR_DB') {
      throw new RangeNotSatisfiableError()
    }
    throw err
  }

  const headers = { Count: data.count }

  if (pageRequest.size != null) {
    headers.Size = pageRequest.size // Deprecated, use Link header instead.
  }

  // @ts-ignore
  if (pageRequest.page != null) {
    // @ts-ignore
    headers.Page = pageRequest.page // Deprecated, use Link header instead.
  }

  const link = getLinkHeader({
    url: requestUrl.pathname,
    pageRequest,
    items: data.uploads,
    count: data.count
  })

  if (link) {
    headers.Link = link
  }

  // @ts-ignore
  return new JSONResponse(data.uploads, { headers })
}

/**
 * Generates a HTTP `Link` header for the given page request and data.
 *
 * @param {Object} args
 * @param {string|URL} args.url Base URL
 * @param {PageRequest} args.pageRequest Details for the current page of data
 * @param {Array<{ created: string }>} args.items Page items
 * @param {number} args.count Total items available
 */
function getLinkHeader ({ url, pageRequest, items, count }) {
  const rels = []

  if ('before' in pageRequest) {
    const { size } = pageRequest
    if (items.length === size) {
      const oldest = items[items.length - 1]
      // @ts-ignore
      const nextParams = new URLSearchParams({ size, before: oldest.created })
      rels.push(`<${url}?${nextParams}>; rel="next"`)
    }
  } else if ('page' in pageRequest) {
    const { size, page } = pageRequest
    // @ts-ignore
    const pages = Math.ceil(count / size)
    if (page < pages) {
      // @ts-ignore
      const nextParams = new URLSearchParams({ size, page: page + 1 })
      rels.push(`<${url}?${nextParams}>; rel="next"`)
    }

    // @ts-ignore
    const lastParams = new URLSearchParams({ size, page: pages })
    rels.push(`<${url}?${lastParams}>; rel="last"`)

    // @ts-ignore
    const firstParams = new URLSearchParams({ size, page: 1 })
    rels.push(`<${url}?${firstParams}>; rel="first"`)

    if (page > 1) {
      // @ts-ignore
      const prevParams = new URLSearchParams({ size, page: page - 1 })
      rels.push(`<${url}?${prevParams}>; rel="previous"`)
    }
  } else {
    throw new Error('unknown page request type')
  }

  return rels.join(', ')
}

/**
 * Retrieve a single user upload.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userUploadGet (request, env) {
  // @ts-ignore
  const cid = request.params.cid
  let res
  try {
    // @ts-ignore
    res = await env.db.getUpload(cid, request.auth.user._id)
  } catch (error) {
    return notFound()
  }

  return new JSONResponse(res)
}

/**
 * Delete an user upload. This actually raises a tombstone rather than
 * deleting it entirely.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userUploadsDelete (request, env) {
  // @ts-ignore
  const cid = request.params.cid
  const user = request.auth.user._id

  // @ts-ignore
  const res = await env.db.deleteUpload(user, cid)
  if (res) {
    return new JSONResponse(res)
  }

  throw new HTTPError('Upload not found', 404)
}

/**
 * Renames a user's upload.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userUploadsRename (request, env) {
  const user = request.auth.user._id
  // @ts-ignore
  const { cid } = request.params
  const { name } = await request.json()

  // @ts-ignore
  const res = await env.db.renameUpload(user, cid, name)
  return new JSONResponse(res)
}

/**
 * List a user's pins regardless of the token used.
 * As we don't want to scope the Pinning Service API to users
 * we need a new endpoint as an umbrella.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userPinsGet (request, env) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl

  const pageRequest = pagination(searchParams)
  const urlParams = new URLSearchParams(requestUrl.search)
  const params = Object.fromEntries(urlParams)

  const psaParams = validateSearchParams(params)
  if (psaParams.error) {
    throw psaParams.error
  }

  const tokens = (await env.db.listKeys(request.auth.user._id, { includeDeleted: true })).map((key) => key._id)

  let pinRequests

  try {
    // @ts-ignore
    pinRequests = await env.db.listPsaPinRequests(tokens, {
      ...psaParams.data,
      limit: pageRequest.size,
      // @ts-ignore
      offset: pageRequest.size * (pageRequest.page - 1)
    })
  } catch (err) {
    // @ts-ignore
    if (err.code === 'RANGE_NOT_SATISFIABLE_ERROR_DB') {
      throw new RangeNotSatisfiableError()
    }
    throw err
  }

  const pins = pinRequests.results.map((pinRequest) => toPinStatusResponse(pinRequest))

  const headers = {
    Count: pinRequests.count
  }

  if (pageRequest.size != null) {
    headers.Size = pageRequest.size // Deprecated, use Link header instead.
  }

  // @ts-ignore
  if (pageRequest.page != null) {
    // @ts-ignore
    headers.Page = pageRequest.page // Deprecated, use Link header instead.
  }

  const link = getLinkHeader({
    url: requestUrl.pathname,
    pageRequest,
    items: pinRequests.results,
    count: pinRequests.count
  })

  if (link) {
    headers.Link = link
  }

  return new JSONResponse({
    count: pinRequests.count,
    results: pins
  // @ts-ignore
  }, { headers })
}

/**
 *  List a user's pins regardless of the token used.
 *  As we don't want to scope the Pinning Service API to users
 *  we need a new endpoint as an umbrella.
 *
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<JSONResponse>}
 */
export async function userPinDelete (request, env, ctx) {
  // @ts-ignore
  const requestId = request.params?.requestId

  if (!requestId) {
    throw new PSAErrorRequiredData(REQUIRED_REQUEST_ID)
  }

  if (typeof requestId !== 'string') {
    throw new PSAErrorInvalidData(INVALID_REQUEST_ID)
  }

  // TODO: Improve me, it is un-optimal to get the tokens in a separate request to the db.
  const tokens = (await env.db.listKeys(request.auth.user._id, { includeDeleted: true })).map((key) => key._id)

  try {
    // Update deleted_at (and updated_at) timestamp for the pin request.
    await env.db.deletePsaPinRequest(requestId, tokens)
  } catch (e) {
    console.error(e)
    throw new PSAErrorResourceNotFound()
  }

  return new JSONResponse({}, { status: 202 })
}

/**
 * @param {string} userProposalForm
 * @param {string} tagName
 * @param {string} requestedTagValue
 */
const notifySlack = async (
  user,
  tagName,
  requestedTagValue,
  userProposalForm,
  env
) => {
  const webhookUrl = env.SLACK_USER_REQUEST_WEBHOOK_URL

  if (!webhookUrl) {
    return
  }

  let form
  try {
    form = JSON.parse(userProposalForm)
  } catch (e) {
    console.error('Failed to parse user request form: ', e)
    return
  }

  globalThis.fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      text: `
>*Username*
>${user.name}
>
>*Email*
>${user.email}
>
>*User Id*
>${user._id}
>
>*Requested Tag Name*
>${tagName}
>
>*Requested Tag Value*
>${tagName === 'StorageLimitBytes' && requestedTagValue === '' ? '1TiB' : requestedTagValue}
>${form
        .map(
          ({ label, value }) => `
>*${label}*
>${value}
>`
        )
        .join('')}
`
    })
  })
}

/**
 * Get a user's payment settings.
 *
 * @param {AuthenticatedRequest} request
 * @param {Pick<BillingEnv, 'billing'|'customers'|'subscriptions'>} env
 */
export async function userPaymentGet (request, env) {
  const userPaymentSettings = await getPaymentSettings({
    billing: env.billing,
    customers: env.customers,
    subscriptions: env.subscriptions,
    user: { ...request.auth.user, id: request.auth.user._id }
  })
  if (userPaymentSettings instanceof Error) {
    switch (userPaymentSettings.code) {
      case (new CustomerNotFound().code):
        return new JSONResponse({
          message: `Unexpected error fetching payment settings: ${userPaymentSettings.code}`
        }, { status: 500 })
      default: // unexpected error
        throw userPaymentSettings
    }
  }
  return new JSONResponse({
    ...userPaymentSettings,
    subscription: userPaymentSettings.subscription
  })
}

/**
 * @typedef {import('./utils/billing-types.js').BillingEnv} BillingEnv
 */

/**
 * Save a user's payment settings.
 *
 * @param {AuthenticatedRequest} request
 * @param {Pick<BillingEnv, 'billing'|'customers'|'subscriptions'|'agreements'>} env
 */
export async function userPaymentPut (request, env) {
  const requestBody = await request.json()
  const paymentMethodId = requestBody?.paymentMethod?.id
  if (typeof paymentMethodId !== 'string') {
    throw Object.assign(new Error('Invalid payment method'), { status: 400 })
  }
  const subscriptionInput = requestBody?.subscription
  if (!['object', 'undefined'].includes(typeof subscriptionInput)) {
    throw Object.assign(new Error(`subscription must be of type object or undefined, but got ${typeof subscriptionInput}`), { status: 400 })
  }
  const subscriptionStorageInput = subscriptionInput?.storage
  if (subscriptionInput && !(typeof subscriptionStorageInput === 'object' || subscriptionStorageInput === null)) {
    throw Object.assign(new Error('subscription.storage must be an object or null'), { status: 400 })
  }
  if (subscriptionStorageInput && typeof subscriptionStorageInput.price !== 'string') {
    throw Object.assign(new Error('subscription.storage.price must be a string'), { status: 400 })
  }
  const storagePrice = subscriptionStorageInput?.price
  if (storagePrice && !isStoragePriceName(storagePrice)) {
    return new JSONResponse(new Error('invalid .subscription.storage.price'), {
      status: 400
    })
  }
  /** @type {import('../src/utils/billing-types').W3PlatformSubscription|undefined} */
  const subscription = (typeof subscriptionInput === 'undefined')
    ? undefined
    : {
        storage: storagePrice ? { price: storagePrice } : null
      }
  const paymentMethod = { id: paymentMethodId }
  await savePaymentSettings(
    {
      billing: env.billing,
      customers: env.customers,
      user: { ...request.auth.user, id: request.auth.user._id },
      subscriptions: env.subscriptions,
      agreements: env.agreements
    },
    {
      paymentMethod,
      subscription,
      agreement: requestBody.agreement
    },
    {
      name: request.auth.user.name,
      email: request.auth.user.email
    }
  )
  const userPaymentSettingsUrl = '/user/payment'
  const savePaymentSettingsResponse = {
    location: userPaymentSettingsUrl
  }
  return new JSONResponse(savePaymentSettingsResponse, {
    status: 202,
    headers: {
      location: userPaymentSettingsUrl
    }
  })
}
