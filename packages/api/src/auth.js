import * as JWT from './utils/jwt.js'
import {
  AccountRestrictedError,
  DeleteRestrictedError,
  MagicTokenRequiredError,
  NoTokenError,
  PinningUnauthorizedError,
  TokenBlockedError,
  TokenNotFoundError,
  UnrecognisedTokenError,
  UserNotFoundError
} from './errors.js'
import { USER_TAGS } from './constants.js'
import { magicTestModeFromEnv } from './utils/env.js'

/**
 * Middleware: verify the request is authenticated with a valid magic link token.
 * On successful login, adds `auth.user` and `auth.userTags` to the Request
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withMagicToken (handler) {
  /**
   * @param {Request} request
   * @param {import('./env').Env}
   * @returns {Promise<Response>}
   */
  return async (request, env, ctx) => {
    const token = getTokenFromRequest(request, env)

    const magicUser = await tryMagicToken(token, env)
    if (magicUser) {
      const userTags = await getUserTags(magicUser._id, env)
      request.auth = { user: magicUser, userTags }
      // If env.log is not set, then the middlewares may be being run in the wrong order
      env.log.setUser({ id: magicUser._id })
      return handler(request, env, ctx)
    }

    throw new MagicTokenRequiredError()
  }
}

/**
 * Middleware: verify the request is authenticated with a valid an api token *or* a magic link token.
 * On successful login, adds `auth.user`, `auth.authToken`, and `auth.userTags` to the Request
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withApiOrMagicToken (handler) {
  /**
   * @param {Request} request
   * @param {import('./env').Env}
   * @returns {Promise<Response>}
   */
  return async (request, env, ctx) => {
    const token = getTokenFromRequest(request, env)

    const magicUser = await tryMagicToken(token, env)
    if (magicUser) {
      const userTags = await getUserTags(magicUser._id, env)
      request.auth = {
        user: magicUser,
        userTags
      }
      // If env.log is not set, then the middlewares may be being run in the wrong order
      env.log.setUser({ id: magicUser._id })
      return handler(request, env, ctx)
    }

    const apiToken = await tryWeb3ApiToken(token, env)
    if (apiToken) {
      const userTags = await getUserTags(apiToken.user._id, env)
      request.auth = {
        authToken: apiToken,
        user: apiToken.user,
        userTags
      }
      // If env.log is not set, then the middlewares may be being run in the wrong order
      env.log.setUser({ id: apiToken.user._id })
      return handler(request, env, ctx)
    }

    throw new UnrecognisedTokenError()
  }
}

/**
 * Middleware: verify that the authenticated request is for a user whose
 * account is not restricted.
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withAccountNotRestricted (handler) {
  return async (request, env, ctx) => {
    const isAccountRestricted = request.auth.userTags.find(v => (v.tag === USER_TAGS.ACCOUNT_RESTRICTION && v.value === 'true'))
    if (!isAccountRestricted) {
      return handler(request, env, ctx)
    }
    throw new AccountRestrictedError()
  }
}

/**
 * Middleware: verify that the authenticated request is for a user whose
 * ability to delete is not restricted.
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withDeleteNotRestricted (handler) {
  return async (request, env, ctx) => {
    const isDeleteRestricted = request.auth.userTags.find(v => (v.tag === USER_TAGS.DELETE_RESTRICTION && v.value === 'true'))
    if (!isDeleteRestricted) {
      return handler(request, env, ctx)
    }
    throw new DeleteRestrictedError()
  }
}

/**
 * Middleware: verify that the authenticated request is for a user who is
 * authorized to pin.
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withPinningAuthorized (handler) {
  return async (request, env, ctx) => {
    const authorized = request.auth.userTags.find(v => (v.tag === USER_TAGS.PSA_ACCESS && v.value === 'true'))
    if (authorized) {
      return handler(request, env, ctx)
    }
    throw new PinningUnauthorizedError()
  }
}

/**
 * @param {string} token
 * @param {import('./env').Env} env
 * @throws UserNotFoundError
 * @returns {Promise<import('@web3-storage/db/db-client-types').UserOutput> | null }
 */
async function tryMagicToken (token, env) {
  let issuer = null
  let tokenWasValidated = false
  const isMagicTestMode = magicTestModeFromEnv(env)
  const requiresTokenValidation = !isMagicTestMode
  try {
    env.magic.token.validate(token)
    tokenWasValidated = true
  } catch (error) {
    throw error
  }
  if (requiresTokenValidation && !tokenWasValidated) {
    return null
  }
  try {
    const [, claim] = env.magic.token.decode(token)
    issuer = claim.iss
  } catch (_) {
    // test mode for magic admin sdk is "coming soon"
    // see: https://magic.link/docs/introduction/test-mode#coming-soon
    if (env.DANGEROUSLY_BYPASS_MAGIC_AUTH && token === 'test-magic') {
      console.log(`!!! tryMagicToken bypassed with test token "${token}" !!!`)
      issuer = 'test-magic-issuer'
    } else {
      // not a magic token, give up.
      return null
    }
  }
  // token is a magic.link token! let's go!
  const user = await findUserByIssuer(issuer, env)
  if (!user) {
    // we have a magic token, but no user for them!
    throw new UserNotFoundError()
  }
  return user
}

/**
 * @param {string} token
 * @param {import('./env').Env}
 * @throws TokenNotFoundError
 * @returns {import(./user).AuthToken | null }
 */
async function tryWeb3ApiToken (token, env) {
  let decoded = null
  try {
    await JWT.verify(token, env.SALT)
    decoded = JWT.parse(token)
  } catch (_) {
    // not a web3 api token, give up
    return null
  }
  // it's a web3 api token! let's go!
  const apiToken = await verifyAuthToken(token, decoded, env)
  if (!apiToken) {
    // we have a web3 api token, but it's no longer valid
    throw new TokenNotFoundError()
  }

  if (apiToken.isDeleted) {
    const isBlocked = await checkIsTokenBlocked(apiToken, env)

    if (isBlocked) {
      throw new TokenBlockedError()
    } else {
      throw new TokenNotFoundError()
    }
  }

  return apiToken
}

function findUserByIssuer (issuer, env) {
  return env.db.getUser(issuer)
}

function getUserTags (userId, env) {
  return env.db.getUserTags(userId)
}

function checkIsTokenBlocked (token, env) {
  return env.db.checkIsTokenBlocked(token)
}

function verifyAuthToken (token, decoded, env) {
  return env.db.getKey(decoded.sub, token)
}

function getTokenFromRequest (request, { magic }) {
  const authHeader = request.headers.get('Authorization') || ''
  if (!authHeader) {
    throw new NoTokenError()
  }
  // NOTE: This is not magic specific, we're just reusing the header parsing logic.
  const token = magic.utils.parseAuthorizationHeader(authHeader)
  if (!token) {
    throw new NoTokenError()
  }
  return token
}
