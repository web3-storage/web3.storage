import { gql } from '@web3-storage/db'
import * as JWT from './utils/jwt.js'

/**
 * @typedef {{
 *   user: { _id: string, issuer: string }
 *   authKey?: { _id: string, name: string }
 * }} Auth
 * @typedef {Request & { auth: Auth }} AuthenticatedRequest
 */

/**
 * @param {Request} request 
 * @param {import('./env').Env} env
 * @returns {Response}
 */
export async function authLoginPost(request, env) {
  const user = await loginOrRegister(request, env)
  return new Response(JSON.stringify({ issuer: user.issuer }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 */
async function loginOrRegister(request, env) {
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
    mutation CreateOrUpdateUser($input: CreateOrUpdateUserInput!) {
      createOrUpdateUser(input: $input) {
        issuer
      }
    }
  `, { input: parsed })

  return res.createOrUpdateUser
}

/**
 * @param {import('@magic-ext/oauth').OAuthRedirectResult} data
 * @param {import('@magic-sdk/admin').MagicUserMetadata} magicMetadata
 * @returns {Promise<User>}
 */
function parseGitHub({ oauth }, { issuer, email, publicAddress }) {
  return {
    name: oauth.userInfo.name || '',
    picture: oauth.userInfo.picture || '',
    issuer,
    email,
    github: oauth.userHandle,
    publicAddress,
  }
}

/**
 * @param {import('@magic-sdk/admin').MagicUserMetadata} magicMetadata
 * @returns {User}
 */
function parseMagic({ issuer, email, publicAddress }) {
  const name = email.split('@')[0]
  return {
    name,
    picture: '',
    issuer,
    email,
    publicAddress,
  }
}

/**
 * Middleware to validate authorization header in request.
 * 
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export async function withAuth(handler) {
  /**
   * @param {Request} request
   * @param {import('./env').Env}
   * @returns {Response}
   */
  return async (request, env, ctx) => {
    const auth = request.headers.get('Authorization') || ''
    const token = env.magic.utils.parseAuthorizationHeader(auth)

    // validate access tokens
    if (await JWT.verify(token, env.SALT)) {
      const decoded = JWT.parse(token)
      const res = await env.db.query(gql`
        query VerifyAuthKey ($issuer: String!, $secret: String!) {
          verifyAuthKey(issuer: $issuer, secret: $secret) {
            _id
            name
          }
        }
      `, { issuer: decoded.sub, secret: token })

      const authKey = res.verifyAuthKey
      if (!authKey) {
        throw new Error('invalid token')
      }

      request.auth = { user, authKey }
      return handler(request, env, ctx)
    }

    // validate magic id tokens
    env.magic.token.validate(token)
    const [proof, claim] = env.magic.token.decode(token)
    const user = await getUser(claim.iss)
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
 export async function authKeysPost(request, env) {
  const { name } = await request.json()
  const { _id, issuer } = request.auth.user
  const sub = issuer
  const iss = 'web3-storage'
  const secret = await JWT.sign({ sub, iss, iat: Date.now(), name }, secret)

  await env.db.query(gql`
    mutation CreateAuthKey($data: AuthKeyInput!) {
      createAuthKey(data: $data) {
        _id
      }
    }
  `, { data: { user: { connect: _id }, name, secret } })

  return new Response()
}

