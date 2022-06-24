import * as JWT from './utils/jwt.js'
import { JSONResponse } from './utils/json-response.js'
import { JWT_ISSUER } from './constants.js'
import { HTTPError } from './errors.js'
import { getTagValue, hasPendingTagProposal, hasTag } from './utils/tags.js'
import {
  NO_READ_OR_WRITE,
  READ_WRITE,
  READ_ONLY,
  maintenanceHandler
} from './maintenance.js'

/**
 * @typedef {{ _id: string, issuer: string }} User
 * @typedef {{ _id: string, name: string }} AuthToken
 * @typedef {{ user: User authToken?: AuthToken }} Auth
 * @typedef {Request & { auth: Auth }} AuthenticatedRequest
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

const sortableValues = ['Name', 'Date']

/**
 * Retrieve a page of user uploads.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userUploadsGet (request, env) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl

  let size = 25
  if (searchParams.has('size')) {
    const parsedSize = parseInt(searchParams.get('size'))
    if (isNaN(parsedSize) || parsedSize <= 0 || parsedSize > 1000) {
      throw Object.assign(new Error('invalid page size'), { status: 400 })
    }
    size = parsedSize
  }

  let offset = 0
  let page = 1
  if (searchParams.has('page')) {
    const parsedPage = parseInt(searchParams.get('page'))
    if (isNaN(parsedPage) || parsedPage <= 0) {
      throw Object.assign(new Error('invalid page number'), { status: 400 })
    }
    offset = (parsedPage - 1) * size
    page = parsedPage
  }

  let before
  if (searchParams.has('before')) {
    const parsedBefore = new Date(searchParams.get('before'))
    if (isNaN(parsedBefore.getTime())) {
      throw Object.assign(new Error('invalid before date'), { status: 400 })
    }
    before = parsedBefore.toISOString()
  }

  let after
  if (searchParams.has('after')) {
    const parsedAfter = new Date(searchParams.get('after'))
    if (isNaN(parsedAfter.getTime())) {
      throw Object.assign(new Error('invalid after date'), { status: 400 })
    }
    after = parsedAfter.toISOString()
  }

  const sortBy = searchParams.get('sortBy') || 'Date'
  const sortOrder = searchParams.get('sortOrder') || 'Desc'

  if (!sortableValues.includes(sortBy)) {
    throw Object.assign(new Error(`Sorting by '${sortBy}' is not supported.`), { status: 400 })
  }

  const data = await env.db.listUploads(request.auth.user._id, {
    size,
    offset,
    before,
    after,
    sortBy,
    sortOrder
  })

  const headers = {
    Count: data.count,
    Size: size,
    Page: page
  }

  let Link = ''
  // If there's more results to show...
  if (page > 1) {
    Link += `<${requestUrl.pathname}?size=${size}&page=${encodeURIComponent(page - 1)}>; rel="previous"`
  }

  if (data.uploads.length + offset < data.count) {
    if (Link !== '') Link += ', '
    Link += `<${requestUrl.pathname}?size=${size}&page=${encodeURIComponent(page + 1)}>; rel="next"`
  }


  return new JSONResponse(data.uploads, { headers })
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
