import * as Link from 'multiformats/link'
import * as Digest from 'multiformats/hashes/digest'
import { fromString } from 'uint8arrays'
import { CAR_CODE } from '../constants.js'

/**
 * Attempts to extract a CAR CID from a bucket key.
 *
 * @param {string} key
 */
export const bucketKeyToCarCID = key => {
  const filename = String(key.split('/').at(-1))
  const [hash] = filename.split('.')
  try {
    // recent buckets encode CAR CID in filename
    const cid = Link.parse(hash).toV1()
    if (cid.code === CAR_CODE) return cid
    throw new Error('not a CAR CID')
  } catch (err) {
    // older buckets base32 encode a CAR multihash <base32(car-multihash)>.car
    try {
      const digestBytes = fromString(hash, 'base32')
      const digest = Digest.decode(digestBytes)
      return Link.create(CAR_CODE, digest)
    } catch {}
  }
}
