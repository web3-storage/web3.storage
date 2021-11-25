/* eslint-env browser */
import { sha256 } from 'multiformats/hashes/sha2'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { PublicKey, KeyType } from './pb/keys.js'
import { errCode } from '../err-code.js'

const PUBLIC_KEY_BYTE_LENGTH = 32

const ERROR_NON_ED25519_PUBLIC_KEY = 'ERROR_NON_ED25519_PUBLIC_KEY'
const ERROR_INVALID_KEY_LENGTH = 'ERROR_INVALID_KEY_LENGTH'

/**
 * NODE-ED25519 exists only in the CloudFlare workers runtime API
 * see: https://developers.cloudflare.com/workers/runtime-apis/web-crypto#footnote%201
 */
const CLOUDFLARE_ED25519 = {
  name: 'NODE-ED25519',
  namedCurve: 'NODE-ED25519'
}

/**
 * @param {Uint8Array} key Public key to verify with.
 * @param {Uint8Array} sig Signature used to sign the data.
 * @param {Uint8Array} data Data to verify.
 */
async function verify (key, sig, data) {
  try {
    const cryptoKey = await crypto.subtle.importKey('raw', key, CLOUDFLARE_ED25519, false, ['verify'])
    return crypto.subtle.verify(CLOUDFLARE_ED25519, cryptoKey, sig, data)
  } catch (err) {
    if (err instanceof Error && err.name === 'NotSupportedError') {
      console.warn('using tweetnacl for ed25519 - you should not see this message when running in the CloudFlare worker runtime')
      const { default: nacl } = await import('tweetnacl')
      return nacl.sign.detached.verify(data, sig, key)
    }
    throw err
  }
}

/**
 * @param {Uint8Array} buf
 */
export function unmarshalPublicKey (buf) {
  const decoded = PublicKey.decode(buf)
  const data = decoded.Data
  if (decoded.Type !== KeyType.Ed25519) {
    throw errCode(new Error('invalid public key type'), ERROR_NON_ED25519_PUBLIC_KEY)
  }
  return unmarshalEd25519PublicKey(data)
}

class Ed25519PublicKey {
  constructor (key) {
    this._key = ensureKey(key, PUBLIC_KEY_BYTE_LENGTH)
  }

  async verify (data, sig) {
    return verify(this._key, sig, data)
  }

  marshal () {
    return this._key
  }

  get bytes () {
    return PublicKey.encode({
      Type: KeyType.Ed25519,
      Data: this.marshal()
    }).finish()
  }

  equals (key) {
    return uint8ArrayEquals(this.bytes, key.bytes)
  }

  async hash () {
    const { bytes } = await sha256.digest(this.bytes)
    return bytes
  }
}

function unmarshalEd25519PublicKey (bytes) {
  bytes = ensureKey(bytes, PUBLIC_KEY_BYTE_LENGTH)
  return new Ed25519PublicKey(bytes)
}

/**
 * @param {Uint8Array} key
 * @param {number} length
 */
function ensureKey (key, length) {
  key = Uint8Array.from(key || [])
  if (key.length !== length) {
    throw errCode(new Error(`key must be a Uint8Array of length ${length}, got ${key.length}`), ERROR_INVALID_KEY_LENGTH)
  }
  return key
}
