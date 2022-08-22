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
import { magicLinkBypass } from './magic.link.js'
import { magicTestModeFromEnv as magicTestModeEnabledFromEnv } from './utils/env.js'

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

function isDangerouslyAllowedToken (env, token, dangerousBypass) {
  return (env[dangerousBypass.requiredVariableName] && token === dangerousBypass.requiredTokenValue)
}

function isMagicTestModeToken (token) {
  const parsed = JSON.parse(globalThis.atob(token))
  if (parsed.length !== 2) {
    // unexpeced parse
    return false
  }
  const claims = JSON.parse(parsed[1])
  const isTestModeSub = (claims) => claims.sub === 'TEST_MODE_USER_ID'
  const isTestModeAud = (claims) => claims.aud === 'TEST_MODE_CLIENT_ID'
  const isTestModeToken = [isTestModeAud(claims), isTestModeSub(claims)].every(Boolean)
  return isTestModeToken
}

function isDangerouslyAllowedMagicTestmodeToken (env, token) {
  if (!magicTestModeEnabledFromEnv(env)) {
    // magic testMode isn't enabled, so it can't be an allowed testMode token
    return false
  }
  return isMagicTestModeToken(token)
}

/**
 * Given an api token, try to parse it and determine the issuer of the token.
 * Allowed tokens:
 * * magic.link token: common in prod. the token may be a magic link token. The issuer is a claim in the token's JWT.
 * * magic.link testMode token: common during e2e tests using testMode. The tokens syntactically like non-testMode tokens, but they may throw errors with some magic sdk methods.
 *   These should only be allowed when the magicTestModeEnabledFromEnv is true. The issuer comes from the token's JWT.
 * * testing token: the token may be a special allowlisted token that are used for testing routes behind an authz middleware.
 *   These are allowed based on param dangerousAuthBypassForTesting. The issuer comes from dangerousAuthBypassForTesting.defaults.issuer
 * @param {Record<string,string>} - e.g. env variables to load configuration from
 * @param {string} token - api token sent in a request
 * @param {AuthBypass} dangerousAuthBypassForTesting - configures how to handle testing tokens
 * @returns {null | {issuer: string}} information about the api token
 */
function authenticateMagicToken (env, token, dangerousAuthBypassForTesting) {
  let tokenWasValidated = false
  // check if this is a special case allowed token (e.g. used when unit testing api)
  if (isDangerouslyAllowedToken(env, token, dangerousAuthBypassForTesting)) {
    return dangerousAuthBypassForTesting.defaults
  }
  const tokenRequiresValidation = !isDangerouslyAllowedMagicTestmodeToken(env, token)
  if (tokenRequiresValidation) {
    try {
      env.magic.token.validate(token)
      tokenWasValidated = true
    } catch (error) {
      console.warn('error validating magic token: ', error.name, error.message)
    }
  }
  // invalid tokens return a null issuer
  if (tokenRequiresValidation && !tokenWasValidated) {
    return null
  }
  // token is magic token and doesn't require further validation
  try {
    const [, magicClaims] = env.magic.token.decode(token)
    return magicClaims
  } catch (error) {
    console.warn('error decoding magic token', error.name, error.message)
  }
  // no info could be determined from token
  return null
}

/**
 * @param {string} token
 * @param {import('./env').Env} env
 * @param {AuthBypass} [dangerousAuthBypassForTesting] - configures how to handle testing tokens
 * @throws UserNotFoundError
 * @returns {Promise<import('@web3-storage/db/db-client-types').UserOutput> | null }
 */
async function tryMagicToken (token, env, dangerousAuthBypassForTesting = magicLinkBypass) {
  const { issuer } = authenticateMagicToken(env, token, dangerousAuthBypassForTesting)
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
