import { gql } from '@web3-storage/db'
import * as JWT from './utils/jwt.js'
import { JSONResponse } from './utils/json-response.js'
import { JWT_ISSUER } from './constants.js'

/**
 * @typedef {{
 *   user: { _id: string, issuer: string }
 *   authToken?: { _id: string, name: string }
 * }} Auth
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

  const parsed = data.type === 'github'
    ? parseGitHub(data.data, metadata)
    : parseMagic(metadata)

  const res = await env.db.query(gql`
    mutation CreateOrUpdateUser($data: CreateOrUpdateUserInput!) {
      createOrUpdateUser(data: $data) {
        issuer
      }
    }
  `, { data: parsed })

  return res.createOrUpdateUser
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
 * Middleware to validate authorization header in request.
 *
 * On successful login, adds a `auth` property on the Request
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withAuth (handler) {
  /**
   * @param {Request} request
   * @param {import('./env').Env}
   * @returns {Response}
   */
  return async (request, env, ctx) => {
    const auth = request.headers.get('Authorization') || ''
    // TODO: Should this throw if no auth token with meaningful error?
    const token = env.magic.utils.parseAuthorizationHeader(auth)

    // validate access tokens
    if (await JWT.verify(token, env.SALT)) {
      const decoded = JWT.parse(token)
      const res = await env.db.query(gql`
        query VerifyAuthToken ($issuer: String!, $secret: String!) {
          verifyAuthToken(issuer: $issuer, secret: $secret) {
            _id
            name
            user {
              _id
              issuer
            }
          }
        }
      `, { issuer: decoded.sub, secret: token })

      const authToken = res.verifyAuthToken
      if (!authToken) {
        throw new Error('invalid token')
      }

      request.auth = { user: authToken.user, authToken }
      return handler(request, env, ctx)
    }

    // validate magic id tokens
    env.magic.token.validate(token)
    const [, claim] = env.magic.token.decode(token)
    const res = await env.db.query(gql`
      query FindUserByIssuer ($issuer: String!) {
        findUserByIssuer(issuer: $issuer) {
          _id
          issuer
        }
      }
    `, { issuer: claim.iss })

    const user = res.findUserByIssuer
    if (!user) {
      throw new Error('user not found')
    }

    request.auth = { user }
    return handler(request, env, ctx)
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

  const res = await env.db.query(gql`
    mutation CreateAuthToken($data: CreateAuthTokenInput!) {
      createAuthToken(data: $data) {
        _id
      }
    }
  `, { data: { user: _id, name, secret } })

  return new JSONResponse(res.createAuthToken, { status: 201 })
}

/**
 * Retrieve user auth tokens.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userTokensGet (request, env) {
  const res = await env.db.query(gql`
    query FindAuthTokensByUser($user: ID!) {
      # Paginated but users are probably not going to have tons of these.
      # Note: 100,000 is the max page size.
      findAuthTokensByUser(user: $user, _size: 100000) {
        data {
          _id
          name
          secret
          created
        }
      }
    }
  `, { user: request.auth.user._id })

  return new JSONResponse(res.findAuthTokensByUser.data)
}

/**
 * Delete a user auth token. This actually raises a tombstone rather than
 * deleting it entirely.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userTokensDelete (request, env) {
  const res = await env.db.query(gql`
    mutation DeleteAuthToken($user: ID!, $authToken: ID!) {
      deleteAuthToken(user: $user, authToken: $authToken) {
        _id
      }
    }
  `, { user: request.auth.user._id, authToken: request.params.id })

  return new JSONResponse(res.deleteAuthToken)
}

/**
 * Retrieve a page of user uploads.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userUploadsGet (request, env) {
  const { searchParams } = new URL(request.url)

  let size = 25
  if (searchParams.has('size')) {
    const parsedSize = parseInt(searchParams.get('size'))
    if (isNaN(parsedSize) || parsedSize <= 0 || parsedSize > 100) {
      throw Object.assign(new Error('invalid page size'), { status: 400 })
    }
    size = parsedSize
  }

  let before = new Date()
  if (searchParams.has('before')) {
    const parsedBefore = new Date(searchParams.get('before'))
    if (isNaN(parsedBefore.getTime())) {
      throw Object.assign(new Error('invalid before date'), { status: 400 })
    }
    before = parsedBefore
  }

  const res = await env.db.query(gql`
    query FindUploadsByUser($where: FindUploadsByUserInput!, $size: Int!) {
      findUploadsByUser(where: $where, _size: $size) {
        data {
          _id
          name
          content {
            cid
            dagSize
          }
          created
        }
      }
    }
  `, { where: { createdBefore: before.toISOString(), user: request.auth.user._id }, size })

  return new JSONResponse(res.findUploadsByUser.data)
}

/**
 * Delete an user upload. This actually raises a tombstone rather than
 * deleting it entirely.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userUploadsDelete (request, env) {
  const user = request.auth.user._id
  const upload = request.params.id

  const res = await env.db.query(gql`
    mutation DeleteUserUpload($user: ID!, $upload: ID!) {
      deleteUserUpload(user: $user, upload: $upload) {
        _id
      }
    }
  `, { upload, user })

  return new JSONResponse(res.deleteUserUpload)
}
