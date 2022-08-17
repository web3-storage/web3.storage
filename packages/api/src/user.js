import * as JWT from './utils/jwt.js'
import { JSONResponse } from './utils/json-response.js'
import { JWT_ISSUER } from './constants.js'
import { HTTPError, RangeNotSatisfiableError } from './errors.js'
import { getTagValue, hasPendingTagProposal, hasTag } from './utils/tags.js'
import {
  NO_READ_OR_WRITE,
  READ_WRITE,
  READ_ONLY,
  maintenanceHandler
} from './maintenance.js'
import { pagination } from './utils/pagination.js'
import { toPinStatusResponse } from './pins.js'
import { validateSearchParams } from './utils/psa.js'

/**
 * @typedef {{ _id: string, issuer: string }} User
 * @typedef {{ _id: string, name: string }} AuthToken
 * @typedef {{ user: User authToken?: AuthToken }} Auth
 * @typedef {Request & { auth: Auth }} AuthenticatedRequest
 * @typedef {import('@web3-storage/db').PageRequest} PageRequest
 */

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 * @returns {Response}
 */
export async function userLoginPost (request, env) {
  const user = await loginOrRegister(request, env)
  return new JSONResponse({ issuer: user.issuer })
}

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 */
async function loginOrRegister (request, env) {
  const data = await request.json()
  const auth = request.headers.get('Authorization') || ''

  const token = env.magic.utils.parseAuthorizationHeader(auth)
  env.magic.token.validate(token)

  const metadata = await env.magic.users.getMetadataByToken(token)
  const { issuer, email, publicAddress } = metadata
  if (!issuer || !email || !publicAddress) {
    throw new Error('missing required metadata')
  }

  const parsed =
    data.type === 'github'
      ? parseGitHub(data.data, metadata)
      : parseMagic(metadata)

  let user
  // check if maintenance mode
  if (env.MODE === NO_READ_OR_WRITE) {
    return maintenanceHandler()
  } else if (env.MODE === READ_WRITE) {
    user = await env.db.upsertUser(parsed)
  } else if (env.MODE === READ_ONLY) {
    user = await env.db.getUser(parsed.issuer)
  } else {
    throw new Error('Unknown maintenance mode')
  }

  return user
}

/**
 * @param {import('@magic-ext/oauth').OAuthRedirectResult} data
 * @param {import('@magic-sdk/admin').MagicUserMetadata} magicMetadata
 * @returns {Promise<User>}
 */
function parseGitHub ({ oauth }, { issuer, email, publicAddress }) {
  return {
    name: oauth.userInfo.name || '',
    picture: oauth.userInfo.picture || '',
    issuer,
    email,
    github: oauth.userHandle,
    publicAddress
  }
}

/**
 * @param {import('@magic-sdk/admin').MagicUserMetadata} magicMetadata
 * @returns {User}
 */
function parseMagic ({ issuer, email, publicAddress }) {
  const name = email.split('@')[0]
  return {
    name,
    picture: '',
    issuer,
    email,
    publicAddress
  }
}

/**
 * Create a new auth key.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @returns {Response}
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
    env.db.getStorageUsed(request.auth.user._id),
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
    data = await env.db.listUploads(request.auth.user._id, pageRequest)
  } catch (err) {
    if (err.code === 'RANGE_NOT_SATISFIABLE_ERROR_DB') {
      throw new RangeNotSatisfiableError()
    }
    throw err
  }

  const headers = {
    Count: data.count,
    Size: pageRequest.size // Deprecated, use Link header instead.
  }

  if (pageRequest.page != null) {
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
      const nextParams = new URLSearchParams({ size, before: oldest.created })
      rels.push(`<${url}?${nextParams}>; rel="next"`)
    }
  } else if ('page' in pageRequest) {
    const { size, page } = pageRequest
    const pages = Math.ceil(count / size)
    if (page < pages) {
      const nextParams = new URLSearchParams({ size, page: page + 1 })
      rels.push(`<${url}?${nextParams}>; rel="next"`)
    }

    const lastParams = new URLSearchParams({ size, page: pages })
    rels.push(`<${url}?${lastParams}>; rel="last"`)

    const firstParams = new URLSearchParams({ size, page: 1 })
    rels.push(`<${url}?${firstParams}>; rel="first"`)

    if (page > 1) {
      const prevParams = new URLSearchParams({ size, page: page - 1 })
      rels.push(`<${url}?${prevParams}>; rel="previous"`)
    }
  } else {
    throw new Error('unknown page request type')
  }

  return rels.join(', ')
}

/**
 * Delete an user upload. This actually raises a tombstone rather than
 * deleting it entirely.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userUploadsDelete (request, env) {
  const cid = request.params.cid
  const user = request.auth.user._id

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
  const { cid } = request.params
  const { name } = await request.json()

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

  const tokens = (await env.db.listKeys(request.auth.user._id)).map((key) => key._id)

  let pinRequests

  try {
    pinRequests = await env.db.listPsaPinRequests(tokens, {
      ...psaParams.data,
      limit: pageRequest.size,
      offset: pageRequest.size * (pageRequest.page - 1)
    })
  } catch (err) {
    if (err.code === 'RANGE_NOT_SATISFIABLE_ERROR_DB') {
      throw new RangeNotSatisfiableError()
    }
    throw err
  }

  const pins = pinRequests.results.map((pinRequest) => toPinStatusResponse(pinRequest))

  const headers = {
    Count: pinRequests.count
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
  }, { headers })
}

/**
 *
 * @param {number} userId
 * @param {string} userProposalForm
 * @param {string} tagName
 * @param {string} requestedTagValue
 * @param {DBClient} db
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

  /** @type {import('../bindings').RequestForm} */
  let form
  try {
    form = JSON.parse(userProposalForm)
  } catch (e) {
    console.error('Failed to parse user request form: ', e)
    return
  }

  fetch(webhookUrl, {
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
