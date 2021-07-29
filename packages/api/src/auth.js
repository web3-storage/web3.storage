import { gql } from '@web3-storage/db'
import * as JWT from './utils/jwt.js'
import {
  UserNotFoundError,
  TokenNotFoundError,
  UnrecognisedTokenError,
  NoTokenError,
  MagicTokenRequiredError
} from './errors.js'

/**
 * Middleware: verify the request is authenticated with a valid magic link token.
 * On successful login, adds a `auth` property on the Request
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withMagicToken (handler) {
  /**
   * @param {Request} request
   * @param {import('./env').Env}
   * @returns {Response}
   */
  return async (request, env, ctx) => {
    const token = getTokenFromRequest(request, env)
    if (isMagicToken(token, env)) {
      const user = findUserFromMagicToken(token, env)
      if (!user) {
        throw new UserNotFoundError()
      }
      request.auth = { user }
      env.sentry && env.sentry.setUser(user)
      return handler(request, env, ctx)
    }
    throw new MagicTokenRequiredError()
  }
}

/**
 * Middleware: verify the request is authenticated with a valid an api token *or* a magic link token.
 * On successful login, adds a `auth` property on the Request
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withApiOrMagicToken (handler) {
  /**
   * @param {Request} request
   * @param {import('./env').Env}
   * @returns {Response}
   */
  return async (request, env, ctx) => {
    const token = getTokenFromRequest(request, env)
    if (!token) {
      throw new NoTokenError()
    }
    if (isWeb3ApiToken(token, env)) {
      const authToken = await findWeb3ApiToken(token, env)
      if (!authToken) {
        throw new TokenNotFoundError()
      }
      request.auth = { authToken, user: authToken.user }
      env.sentry && env.sentry.setUser(authToken.user)
      return handler(request, env, ctx)
    }
    if (isMagicToken(token, env)) {
      const user = await findUserFromMagicToken(token, env)
      if (!user) {
        throw new UserNotFoundError()
      }
      request.auth = { user }
      env.sentry && env.sentry.setUser(user)
      return handler(request, env, ctx)
    }
    throw new UnrecognisedTokenError()
  }
}

async function findWeb3ApiToken (token, env) {
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
  return res.verifyAuthToken
}

async function findUserFromMagicToken (token, env) {
  const [, claim] = env.magic.token.decode(token)
  const res = await env.db.query(gql`
    query FindUserByIssuer ($issuer: String!) {
      findUserByIssuer(issuer: $issuer) {
        _id
        issuer
      }
    }
  `, { issuer: claim.iss })
  return res.findUserByIssuer
}

async function isWeb3ApiToken (token, { SALT }) {
  return JWT.verify(token, SALT)
}

async function isMagicToken (token, { magic }) {
  return magic.token.validate(token)
}

function getTokenFromRequest (request, { magic }) {
  const authHeader = request.headers.get('Authorization') || ''
  // NOTE: This is not magic specific, we're just reusing the header parsing logic.
  return magic.utils.parseAuthorizationHeader(authHeader)
}
