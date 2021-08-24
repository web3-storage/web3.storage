import { gql } from '@web3-storage/db'
import * as JWT from './utils/jwt.js'
import { JSONResponse } from './utils/json-response.js'
import { JWT_ISSUER } from './constants.js'
import { convertRawContent } from './status.js'

/**
 * @typedef { _id: string, issuer: string } User
 * @typedef { _id: string, name: string } AuthToken
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
 * Retrieve user account data.
 *
 * @param {AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function userAccountGet (request, env) {
  const res = await env.db.query(gql`
    query findUserByID($id: ID!) {
      findUserByID(id: $id) {
        usedStorage
      }
    }
  `, { id: request.auth.user._id })

  return new JSONResponse(res.findUserByID)
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
          uploads(_size: 1) {
            data {
              _id
            }
          }
        }
      }
    }
  `, { user: request.auth.user._id })

  res.findAuthTokensByUser.data = res.findAuthTokensByUser.data.map(t => {
    t.hasUploads = Boolean(t.uploads.data.length)
    delete t.uploads
    return t
  })

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
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl

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

  const sortBy = searchParams.get('sortBy') || 'Date'
  const sortOrder = searchParams.get('sortOrder') || 'Desc'

  const res = await env.db.query(gql`
    query FindUploadsByUser($where: FindUploadsByUserInput!, $sortBy: UploadListSortBy, $sortOrder: Sort, $size: Int!) {
      findUploadsByUser(where: $where, sortBy: $sortBy, sortOrder: $sortOrder, _size: $size) {
        data {
          name
          content {
            cid
            dagSize
            aggregateEntries {
              data {
                aggregate {
                  deals {
                    data {
                      storageProvider
                      renewal
                      dealId
                      status
                    }
                  }
                }
              }
            }
            pins {
              data {
                status
              }
            }
          }
          created
        }
      }
    }
  `, { where: { createdBefore: before.toISOString(), user: request.auth.user._id }, size, sortBy, sortOrder })

  const { data: raw } = res.findUploadsByUser
  const uploads = raw.map(({ name, content, created }) => ({
    name,
    ...convertRawContent(content),
    created
  }))
  const oldest = uploads[uploads.length - 1]
  const headers = uploads.length === size
    ? { Link: `<${requestUrl.pathname}?size=${size}&before=${oldest.created}>; rel="next"` }
    : undefined
  return new JSONResponse(uploads, { headers })
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
  const cid = request.params.cid

  const res = await env.db.query(gql`
    mutation DeleteUserUpload($user: ID!, $cid: String!) {
      deleteUserUpload(user: $user, cid: $cid) {
        _id
      }
    }
  `, { cid, user })

  return new JSONResponse(res.deleteUserUpload)
}
