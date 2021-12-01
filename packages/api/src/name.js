import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as ipns from './utils/ipns/index.js'
import * as Digest from 'multiformats/hashes/digest'
import { base36 } from 'multiformats/bases/base36'
import { CID } from 'multiformats/cid'
import * as ed25519 from './utils/crypto/ed25519.js'
import { PreciseDate } from '@google-cloud/precise-date'
import { HTTPError } from './errors.js'
import { JSONResponse } from './utils/json-response.js'

const libp2pKeyCode = 0x72

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 */
export async function nameGet (request, env) {
  const { params: { key } } = request
  const { code } = CID.parse(key, base36)
  if (code !== libp2pKeyCode) {
    throw new HTTPError(`invalid key, expected: ${libp2pKeyCode} codec code but got: ${code}`, 400)
  }

  const rawRecord = await env.db.resolveNameRecord(key)
  if (!rawRecord) {
    throw new HTTPError(`record not found for key: ${key}. Only keys published using the Web3.Storage API may be resolved here.`, 404)
  }

  const { value } = ipns.unmarshal(uint8ArrayFromString(rawRecord, 'base64pad'))

  return new JSONResponse({
    value: uint8ArrayToString(value),
    record: rawRecord
  })
}

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 */
export async function namePost (request, env) {
  const { params: { key } } = request
  const keyCid = CID.parse(key, base36)

  if (keyCid.code !== libp2pKeyCode) {
    throw new HTTPError(`invalid key code: ${keyCid.code}`, 400)
  }

  const record = await request.text()
  const entry = ipns.unmarshal(uint8ArrayFromString(record, 'base64pad'))
  const pubKey = ed25519.unmarshalPublicKey(Digest.decode(keyCid.multihash.bytes).bytes)

  if (entry.pubKey && !ed25519.unmarshalPublicKey(entry.pubKey).equals(pubKey)) {
    throw new HTTPError('embedded public key mismatch', 400)
  }

  await ipns.validate(pubKey, entry)

  await env.db.publishNameRecord(
    key,
    record,
    Boolean(entry.signatureV2),
    entry.sequence,
    new PreciseDate(uint8ArrayToString(entry.validity)).getFullTime()
  )

  return new JSONResponse({ id: key }, { status: 202 })
}
