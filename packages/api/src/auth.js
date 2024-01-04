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
import { magicLinkBypassForUnitTestingWithTestToken, magicLinkBypassForE2ETestingInTestmode } from './magic.link.js'

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
   * @param {import('./env').Env} env
   * @returns {Promise<Response>}
   */
  return async (request, env, ctx) => {
    const token = getTokenFromRequest(request, env)
    const magicUser = await tryMagicToken(token, env)
    if (magicUser) {
      const userTags = await getUserTags(magicUser._id, env)
      // @ts-ignore
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
   * @param {import('./env').Env} env
   * @returns {Promise<Response>}
   */
  return async (request, env, ctx) => {
    const token = getTokenFromRequest(request, env)
    const magicUser = await tryMagicToken(token, env)
    if (magicUser) {
      const userTags = await getUserTags(magicUser._id, env)
      // @ts-ignore
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
      // @ts-ignore
      const userTags = await getUserTags(apiToken.user._id, env)
      // @ts-ignore
      request.auth = {
        authToken: apiToken,
        // @ts-ignore
        user: apiToken.user,
        userTags
      }
      // If env.log is not set, then the middlewares may be being run in the wrong order
      // @ts-ignore
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
 * Given an api token, try to parse it and determine the issuer of the token.
 * Allowed tokens:
 * * magic.link token: common in prod. the token may be a magic link token. The issuer is a claim in the token's JWT.
 * * magic.link testMode token: common during e2e tests using testMode. The tokens syntactically like non-testMode tokens, but they may throw errors with some magic sdk methods.
 *   These should only be allowed when the magicTestModeEnabledFromEnv is true. The issuer comes from the token's JWT.
 * * testing token: the token may be a special allowlisted token that are used for testing routes behind an auth middleware.
 *   These are allowed based on param dangerousAuthBypassForTesting. The issuer comes from dangerousAuthBypassForTesting.defaults.issuer
 * @param {import('./env').Env} env - e.g. env variables to load configuration from
 * @param {string} token - api token sent in a request
 * @param dangerousAuthBypassForUnitTesting - configures how to handle unit testing tokens
 * @param dangerousAuthBypassForE2eTesting - configures how to handle authenticating e2e test tokens
 * @returns {null | {issuer: string}} information about the api token
 */
function authenticateMagicToken (
  env, token,
  dangerousAuthBypassForUnitTesting = magicLinkBypassForUnitTestingWithTestToken,
  dangerousAuthBypassForE2eTesting = magicLinkBypassForE2ETestingInTestmode
) {
  // handle if the token is allowed based on the e2e testing bypass
  if (dangerousAuthBypassForE2eTesting.isEnabledForToken(env, token)) {
    return dangerousAuthBypassForE2eTesting.authenticateMagicToken(env, token)
  }
  // handle if this is a special case allowed token (e.g. used when unit testing api)
  if (dangerousAuthBypassForUnitTesting.isAllowedToken(env, token)) {
    return dangerousAuthBypassForUnitTesting.defaults
  }

  /** @type {import('@magic-sdk/admin').ParsedDIDToken | null} */
  let decodedToken = null

  try {
    decodedToken = env.magic.token.decode(token)
  } catch (error) {
    return null
  }
  try {
    env.magic.token.validate(token)
  } catch (error) {
    console.warn('error validating magic token: ', error)
    return null
  }
  // token is magic token and doesn't require further validation
  try {
    const magicClaims = decodedToken[1]

    return { issuer: magicClaims.iss }
  } catch (error) {
    console.warn('error parsing decoded magic token', error)
  }
  // no info could be determined from token
  return null
}

/**
 * @param {string} token
 * @param {import('./env').Env} env
 * @throws UserNotFoundError
 * @returns {Promise<import('@web3-storage/db/db-client-types').UserOutput | null> }
 */
async function tryMagicToken (token, env) {
  const authenticatedToken = await authenticateMagicToken(env, token)
  if (!authenticatedToken?.issuer) {
    return null
  }
  const user = await findUserByIssuer(authenticatedToken.issuer, env)
  if (!user) {
    // we have a magic token, but no user for them!
    throw new UserNotFoundError()
  }
  return user
}

/**
 * @param {string} token
 * @param {import('./env').Env} env
 * @throws TokenNotFoundError
 * @returns {Promise<import('./user').AuthToken|null>}
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

export function getTokenFromRequest (request, { magic }) {
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
