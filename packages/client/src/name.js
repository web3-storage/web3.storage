/**
 * A client library for the w3name - IPNS over HTTP API. It provides a
 * convenient interface for creating names, making revisions to name records,
 * and publishing and resolving them via the HTTP API.
 *
 * @example
 * ```js
 * import { Web3Storage } from 'web3.storage'
 * import * as Name from 'web3.storage/name'
 *
 * const client = new Web3Storage({ token: API_TOKEN })
 * const name = await Name.create()
 *
 * console.log('Name:', name.toString())
 * // e.g. k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt
 *
 * // The value to publish
 * const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
 * const revision = await Name.v0(name, value)
 *
 * // Publish the revision
 * await Name.publish(client, revision, name.key)
 *
 * // Resolve the latest value
 * await Name.resolve(name)
 * ```
 * @module
 */
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as ipns from 'ipns'
import * as Digest from 'multiformats/hashes/digest'
import { identity } from 'multiformats/hashes/identity'
import { base36 } from 'multiformats/bases/base36'
import { CID } from 'multiformats/cid'
import { keys } from 'libp2p-crypto'
import * as cbor from 'cborg'
import { fetch } from './platform.js'

const libp2pKeyCode = 0x72
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

const defaultValidity = () => new Date(Date.now() + ONE_YEAR).toISOString()

/**
 * @typedef {{
 *   bytes: Uint8Array,
 *   verify (data: Uint8Array, signature: Uint8Array): Promise<boolean>
 * }} PublicKey
 *
 * @typedef {{
 *   sign (data: Uint8Array): Promise<Uint8Array>
 * }} SigningKey
 *
 * @typedef {{
 *   public: PublicKey,
 *   bytes: Uint8Array
 * } & SigningKey} PrivateKey
 */

/**
 * Name is an IPNS key ID.
 */
export class Name {
  /**
   * @param {PublicKey} pubKey Public key.
   */
  constructor (pubKey) {
    /**
     * @private
     */
    this._pubKey = pubKey
  }

  get bytes () {
    const digest = Digest.create(identity.code, this._pubKey.bytes)
    return CID.createV1(libp2pKeyCode, digest).bytes
  }

  toString () {
    const digest = Digest.create(identity.code, this._pubKey.bytes)
    return CID.createV1(libp2pKeyCode, digest).toString(base36)
  }
}

/**
 * WritableName is a Name that has a signing key associated with it such that
 * new IPNS record revisions can be created and signed for it.
 */
export class WritableName extends Name {
  /**
   * @param {PrivateKey} privKey
   */
  constructor (privKey) {
    super(privKey.public)
    /**
     * @private
     */
    this._privKey = privKey
  }

  get key () {
    return this._privKey
  }
}

/**
 * Create a new name with associated signing key that can be used to create and
 * publish IPNS record revisions.
 *
 * **❗️Experimental** this API may not work, may change, and may be removed.
 */
export async function create () {
  const privKey = await keys.generateKeyPair('Ed25519', 2048)
  return new WritableName(privKey)
}

/**
 * Parses string name to readable name.
 *
 * **❗️Experimental** this API may not work, may change, and may be removed.
 *
 * @param {string} name The name to parse.
 */
export function parse (name) {
  const keyCid = CID.parse(name, base36)
  if (keyCid.code !== libp2pKeyCode) {
    throw new Error(`invalid key, expected ${libp2pKeyCode} codec code but got ${keyCid.code}`)
  }
  const pubKey = keys.unmarshalPublicKey(Digest.decode(keyCid.multihash.bytes).bytes)
  return new Name(pubKey)
}

/**
 * Create a name from an existing signing key (private key).
 *
 * **❗️Experimental** this API may not work, may change, and may be removed.
 *
 * @param {Uint8Array} key Binary representation of the signing key for the name.
 */
export async function from (key) {
  const privKey = await keys.unmarshalPrivateKey(key)
  return new WritableName(privKey)
}

/**
 * Create an initial version of the IPNS record for the passed name, set to the
 * passed value.
 *
 * **❗️Experimental** this API may not work, may change, and may be removed.
 *
 * @param {Name} name
 * @param {string} value
 */
export async function v0 (name, value) {
  return new Revision(name, value, 0n, defaultValidity())
}

/**
 * Create a revision of the passed IPNS record by incrementing the sequence
 * number and changing the value.
 *
 * **❗️Experimental** this API may not work, may change, and may be removed.
 *
 * @param {Revision} revision
 * @param {string} value
 */
export async function increment (revision, value) {
  const seqno = revision.sequence + 1n
  return new Revision(revision.name, value, seqno, defaultValidity())
}

/**
 * A represetation of a IPNS record that may be initial or revised.
 */
export class Revision {
  /**
   * @param {Name} name
   * @param {string} value
   * @param {bigint} sequence
   * @param {string} validity
   */
  constructor (name, value, sequence, validity) {
    this._name = name
    if (typeof value !== 'string') {
      throw new Error('invalid value')
    }
    this._value = value
    if (typeof sequence !== 'bigint') {
      throw new Error('invalid sequence number')
    }
    this._sequence = sequence
    if (typeof validity !== 'string') {
      throw new Error('invalid validity')
    }
    // TODO: validate format
    this._validity = validity
  }

  get name () {
    return this._name
  }

  get value () {
    return this._value
  }

  get sequence () {
    return this._sequence
  }

  /**
   * RFC3339 date string.
   */
  get validity () {
    return this._validity
  }

  /**
   * Note: if `revision.name` is a `WritableName` then signing key data will be
   * lost. i.e. the private key is not encoded.
   *
   * @param {Revision} revision Revision to encode.
   */
  static encode (revision) {
    return cbor.encode({
      name: revision._name.toString(),
      value: revision._value,
      sequence: revision._sequence,
      validity: revision._validity
    })
  }

  /**
   * @param {Uint8Array} bytes
   */
  static decode (bytes) {
    const raw = cbor.decode(bytes)
    const name = parse(raw.name)
    return new Revision(name, raw.value, BigInt(raw.sequence), raw.validity)
  }
}

/**
 * Publish a name revision to Web3.Storage.
 *
 * **❗️Experimental** this API may not work, may change, and may be removed.
 *
 * ⚠️ Name records are not _yet_ published to or updated from the IPFS network.
 * Working with name records simply updates the Web3.Storage cache of data.
 *
 * @param {import('./lib/interface.js').Service} service
 * @param {Revision} revision Revision of record to publish.
 * @param {SigningKey} key Private key to sign the record with.
 */
export async function publish (service, revision, key) {
  const url = new URL(`name/${revision.name}`, service.endpoint)
  const entry = await ipns.create(
    // @ts-expect-error API expects a libp2p-crypto.PrivateKey but only uses SigningKey.sign().
    key,
    uint8ArrayFromString(revision.value),
    revision.sequence,
    new Date(revision.validity).getTime() - Date.now()
  )
  const res = await maybeHandleError(fetch(url.toString(), {
    method: 'POST',
    headers: headers(service.token),
    body: uint8ArrayToString(ipns.marshal(entry), 'base64pad')
  }))
  await res.json()
}

/**
 * Resolve the current IPNS record revision for the passed name.
 *
 * **❗️Experimental** this API may not work, may change, and may be removed.
 *
 * @param {import('./lib/interface.js').PublicService} service
 * @param {Name} name The name to resolve.
 */
export async function resolve (service, name) {
  const url = new URL(`name/${name}`, service.endpoint)
  const res = await maybeHandleError(fetch(url.toString()))
  const { record } = await res.json()
  const entry = ipns.unmarshal(uint8ArrayFromString(record, 'base64pad'))
  const keyCid = CID.decode(name.bytes)
  const pubKey = keys.unmarshalPublicKey(Digest.decode(keyCid.multihash.bytes).bytes)

  await ipns.validate(pubKey, entry)

  return new Revision(
    name,
    uint8ArrayToString(entry.value),
    entry.sequence,
    uint8ArrayToString(entry.validity)
  )
}

/**
 * @param {string} token
 * @returns {Record<string, string>}
 */
function headers (token) {
  if (!token) throw new Error('missing token')
  return {
    Authorization: `Bearer ${token}`,
    'X-Client': 'web3.storage'
  }
}

/**
 * @param {Promise<Response>} resPromise
 * @returns {Promise<Response>}
 */
async function maybeHandleError (resPromise) {
  const res = await resPromise
  if (res.ok) return res
  const err = new Error(`unexpected status: ${res.status}`)
  try {
    Object.assign(err, await res.json())
  } catch {}
  throw err
}
