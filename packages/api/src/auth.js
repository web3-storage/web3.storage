import { base64 } from 'multiformats/bases/base64'
import nacl from 'tweetnacl'
import * as Block from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'
import { identity } from 'multiformats/hashes/identity'
import * as dagCbor from '@ipld/dag-cbor'
import { CID } from 'multiformats'

import * as JWT from './utils/jwt.js'
import {
  UserNotFoundError,
  TokenNotFoundError,
  UnrecognisedTokenError,
  NoTokenError,
  MagicTokenRequiredError,
  UnsupportedBlockchainError
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
 * Middleware: verify the request is authenticated with a valid an api token *or* a magic link token.
 * On successful login, adds `auth.user` and `auth.auth.token` to the Request
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withApiOrMagicTokenOrWalletAuth (handler) {
  /**
   * @param {Request} request
   * @param {import('./env').Env}
   * @returns {Response}
   */
  return async (request, env, ctx) => {
    // first try api or magic token auth
    try {
      const tokenMiddleware = withApiOrMagicToken(handler)
      return tokenMiddleware(request, env, ctx)
    } catch (err) {
      if (err.code !== UnrecognisedTokenError.CODE && err.code !== NoTokenError.CODE) {
        throw err
      }
    }

    const walletAuthInfo = getWalletAuthInfoFromRequest(request)
    tryWalletAuth(walletAuthInfo)
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

function findUserByWalletKey (blockchain, network, publicKey, env) {
  // TODO: lookup / create user based on public key info.
  // The user id derived from the public key should probably include the blockchain
  // and network tags, since the same bytes may be a valid public key for multiple chains / networks.
  return null
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

function getWalletAuthInfoFromRequest (request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    throw new NoTokenError()
  }

  const match = authHeader.match(/^X-Wallet-Signature-([a-z0-9]+)-([a-z0-9]+)\s+(.*)$/)
  if (!match) {
    return null
  }

  // eslint-disable-next-line no-unused-vars
  const [_, blockchain, network, signatureString] = match

  const payloadString = request.headers.get('X-Wallet-Signature-Payload')
  if (!payloadString) {
    return null
  }

  const payloadBytes = base64.decode(payloadString)
  const signatureBytes = base64.decode(signatureString)

  return { payloadBytes, signatureBytes, blockchain, network }
}

async function tryWalletAuth ({ payloadBytes, signatureBytes, blockchain, network }, env) {
  if (!isBlockchainSupported(blockchain)) {
    throw new UnsupportedBlockchainError(blockchain)
  }

  const payload = await decodePayload(payloadBytes)
  validateWalletAuthSignature(payloadBytes, signatureBytes, payload.publicKey)

  const userInfo = await findUserByWalletKey(blockchain, network, payload.publicKey, env)
  if (!userInfo) {
    // Even though we're upserting users if they don't exist, this could happen if e.g. we blacklist a key
    // TODO: custom error
    throw new Error('no user for wallet key')
  }
  return userInfo
}

function isBlockchainSupported (blockchain) {
  const supported = ['solana']
  return supported.includes(blockchain)
}

async function decodePayload (payloadBytes) {
  const payloadBlock = await Block.decode({ bytes: payloadBytes, codec: dagCbor, hasher: sha256 })
  const payloadCbor = payloadBlock.value
  const { cid: cidBytes, publicKeyBytes, context } = payloadCbor
  // TODO: define custom error type for missing fields / invalid cid
  if (!cidBytes) {
    throw new Error('wallet auth payload is missing required "cid" field')
  }
  if (!publicKeyBytes) {
    throw new Error('wallet auth payload is missing required "publicKey" field')
  }
  if (!context) {
    throw new Error('wallet auth payload is missing required "context" field')
  }
  try {
    const cid = CID.decode(cidBytes)
    const publicKey = CID.decode(cidBytes)
    return { cid, publicKey, context }
  } catch (err) {
    throw new Error(`invalid CID in wallet auth payload: ${err.message}`)
  }
}

/**
 *
 * @param {Uint8Array} payloadBytes
 * @param {Uint8Array} signatureBytes
 * @param {CID} keyCID
 */
function validateWalletAuthSignature (payloadBytes, signatureBytes, keyCID) {
  const codeEd25519 = 0xed
  switch (keyCID.code) {
    case codeEd25519:
      return validateEd25519(payloadBytes, signatureBytes, keyBytesFromCID(keyCID))
  }

  // TODO: custom error
  throw new Error(`invalid codec for public key: ${keyCID.code}`)
}

/**
 *
 * @param {CID} cid
 * @returns {Uint8Array}
 */
function keyBytesFromCID (cid) {
  if (cid.multihash.code !== identity.code) {
    throw new Error('public key must use identity multihash codec (raw bytes)')
  }
  return cid.multihash.digest
}

function validateEd25519 (payloadBytes, signatureBytes, publicKeyBytes) {
  const SIGNING_DOMAIN_PREFIX = new TextEncoder().encode('web3-storage-wallet-auth:')
  const toVerify = new Uint8Array([...SIGNING_DOMAIN_PREFIX, payloadBytes])
  const valid = nacl.sign.detached.verify(toVerify, signatureBytes, publicKeyBytes)
  if (!valid) {
    // TODO: custom error
    throw new Error('invalid signature')
  }
}
