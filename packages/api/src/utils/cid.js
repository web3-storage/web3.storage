import { CID } from 'multiformats/cid'
import { InvalidCidError } from '../errors.js'

/**
 * Parse CID and return normalized b32 v1
 *
 * @param {string} cid
 */
export function normalizeCid (cid) {
  try {
    const c = CID.parse(cid)
    return c.toV1().toString()
  } catch (err) {
    throw new InvalidCidError(cid)
  }
}
