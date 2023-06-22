import { fromString } from 'uint8arrays'
import * as Digest from 'multiformats/hashes/digest'
import { CID } from 'multiformats/cid'
import { CAR_CODE } from '../constants.js'

/**
 * Converts a bucket path in format `raw/<root>/<user>/<base32(car-multihash)>.car`
 * to a CAR CID.
 * @param {string} path
 */
export function rawCarPathToShardCid (path) {
  const parts = String(path).split('/')
  const filename = String(parts[3])
  const digestBytes = fromString(filename.split('.')[0], 'base32')
  const digest = Digest.decode(digestBytes)
  return CID.createV1(CAR_CODE, digest)
}
