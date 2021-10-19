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
 * On successful login, adds `auth.user` to the Request
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

    const magicUser = await tryMagicToken(token, env)
    if (magicUser) {
      request.auth = { user: magicUser }
      env.sentry && env.sentry.setUser(magicUser)
      return handler(request, env, ctx)
    }

    throw new MagicTokenRequiredError()
  }
}

/**
 * Middleware: verify the request is authenticated with a valid an api token *or* a magic link token.
 * On successful login, adds `auth.user` and `auth.auth.token` to the Request
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

    const magicUser = await tryMagicToken(token, env)
    if (magicUser) {
      request.auth = { user: magicUser }
      env.sentry && env.sentry.setUser(magicUser)
      return handler(request, env, ctx)
    }

    const apiToken = await tryWeb3ApiToken(token, env)
    if (apiToken) {
      request.auth = { authToken: apiToken, user: apiToken.user }
      env.sentry && env.sentry.setUser(apiToken.user)
      return handler(request, env, ctx)
    }

    throw new UnrecognisedTokenError()
  }
}

/**
 * @param {string} token
 * @param {import('./env').Env}
 * @throws UserNotFoundError
 * @returns {import(./user).User | null }
 */
async function tryMagicToken (token, env) {
  let issuer = null
  try {
    env.magic.token.validate(token)
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
  return apiToken
}

function findUserByIssuer (issuer, env) {
  return env.db.getUser(issuer)
}

function verifyAuthToken (token, decoded, env) {
  return env.db.getKey(decoded.sub, token)
}

function getTokenFromRequest (request, { magic }) {
  const authHeader = request.headers.get('Authorization') || ''
  // NOTE: This is not magic specific, we're just reusing the header parsing logic.
  const token = magic.utils.parseAuthorizationHeader(authHeader)
  if (!token) {
    throw new NoTokenError()
  }
  return token
}
