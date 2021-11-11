import * as uint8arrays from 'uint8arrays'
import * as ipns from 'ipns'
import * as Digest from 'multiformats/hashes/digest'
import { base36 } from 'multiformats/bases/base36'
import { CID } from 'multiformats/cid'
import { keys } from 'libp2p-crypto'
import { HTTPError } from './errors.js'
import { JSONResponse } from './utils/json-response.js'

const libp2pKeyCode = 0x72

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 */
export async function nameGet (request, env) {
  const { params: { key: rawKey } } = request
  const key = CID.parse(rawKey, base36)
  if (key.code !== libp2pKeyCode) {
    throw new HTTPError(`invalid key code: ${key.code}`, 400)
  }

  const record = await env.db.getNameRecord(key)
  if (!record) {
    throw new HTTPError(`record not found for key: ${key}`, 404)
  }

  const { value } = ipns.unmarshal(record)

  return new JSONResponse({
    value: CID.decode(value).toString(),
    record: uint8arrays.toString(record, 'base64pad')
  })
}

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 */
export async function namePost (request, env) {
  const { params: { key: rawKey } } = request
  const key = CID.parse(rawKey, base36)

  if (key.code !== libp2pKeyCode) {
    throw new HTTPError(`invalid key code: ${key.code}`, 400)
  }

  const rawRecord = uint8arrays.fromString(await request.text(), 'base64pad')
  const record = ipns.unmarshal(rawRecord)
  const pubKey = keys.unmarshalPublicKey(Digest.decode(key.multihash.bytes).bytes)

  if (record.pubKey && !keys.unmarshalPublicKey(record.pubKey).equals(pubKey)) {
    throw new HTTPError('embedded public key mismatch', 400)
  }

  await ipns.validate(pubKey, record)
  await env.db.publishNameRecord(rawKey, rawRecord, record.sequence)

  return new JSONResponse({}, 202)
}
