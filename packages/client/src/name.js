import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import * as ipns from 'ipns'
import * as Digest from 'multiformats/hashes/digest'
import { identity } from 'multiformats/hashes/identity'
import { base36 } from 'multiformats/bases/base36'
import { CID } from 'multiformats/cid'
import { keys } from 'libp2p-crypto'
import { fetch } from './platform.js'

const libp2pKeyCode = 0x72

/**
 * Create a private key, and key ID (the "name" used to resolve the current
 * value).
 */
export async function keypair () {
  const privKeyObj = await keys.generateKeyPair('Ed25519', 2048)
  const digest = Digest.create(identity.code, privKeyObj.public.bytes)
  return {
    id: CID.createV1(libp2pKeyCode, digest).toString(base36),
    privateKey: uint8ArrayToString(privKeyObj.bytes, 'base64pad')
  }
}

/**
 * Create a new IPNS record.
 *
 * @param {string} privKey Base 64 encoded private key bytes.
 * @param {string|null} record Base 64 encoded bytes of the existing IPNS
 * record. Records are created with a sequence number incremented from the
 * previous value. Expected to be `null` when creating a brand new record.
 * @param {string} value IPFS path.
 */
export async function create (privKey, record, value) {
  const privKeyBytes = uint8ArrayFromString(privKey, 'base64pad')
  const privKeyObj = await keys.unmarshalPrivateKey(privKeyBytes)
  const lifetime = 1000 * 60 * 60 // TODO: how long?

  let entry = record ? ipns.unmarshal(uint8ArrayFromString(record, 'base64pad')) : null
  const valueBytes = uint8ArrayFromString(value)

  // Determine the record sequence number
  let seqno = 0n
  if (entry && entry.sequence != null) {
    seqno = uint8ArrayEquals(entry.value, valueBytes) ? entry.sequence : entry.sequence + 1n
  }

  entry = await ipns.create(privKeyObj, valueBytes, seqno, lifetime)
  return { record: uint8ArrayToString(ipns.marshal(entry), 'base64pad') }
}

/**
 * Publish an IPNS record to Web3.Storage.
 *
 * ⚠️ Name records are not _yet_ published to or updated from the IPFS network.
 * Working with name records simply updates the Web3.Storage cache of data.
 *
 * @param {import('./lib/interface.js').Service} service
 * @param {string} key "libp2p-key" encoding of the public key.
 * @param {string} record Base 64 encoded buffer of IPNS record to publish.
 */
export async function publish (service, key, record) {
  const url = new URL(`name/${key}`, service.endpoint)
  const res = await ok(fetch(url.toString(), {
    method: 'POST',
    headers: headers(service.token),
    body: record
  }))
  return res.json()
}

/**
 * Resolve the current IPNS record (and it's value) for the passed key ID.
 *
 * @param {import('./lib/interface.js').PublicService} service
 * @param {string} key "libp2p-key" encoding of the public key.
 * @returns {Promise<{ value: string, record: string }>}
 */
export async function resolve (service, key) {
  const keyCid = CID.parse(key, base36)
  if (keyCid.code !== libp2pKeyCode) {
    throw new Error(`invalid key code: ${keyCid.code}`)
  }
  const pubKey = keys.unmarshalPublicKey(Digest.decode(keyCid.multihash.bytes).bytes)
  const url = new URL(`name/${key}`, service.endpoint)
  const res = await ok(fetch(url.toString()))
  const { record } = await res.json()
  const entry = ipns.unmarshal(uint8ArrayFromString(record, 'base64pad'))
  await ipns.validate(pubKey, entry)
  return { value: uint8ArrayToString(entry.value), record }
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
async function ok (resPromise) {
  const res = await resPromise
  if (res.ok) return res
  const err = new Error(`unexpected status: ${res.status}`)
  try {
    Object.assign(err, await res.json())
  } catch {}
  throw err
}
