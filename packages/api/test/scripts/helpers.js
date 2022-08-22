import { CID } from 'multiformats/cid'
import * as JWT from '../../src/utils/jwt.js'
import { JWT_ISSUER } from '../../src/constants.js'
import { SALT } from './worker-globals.js'
import { sha256 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import { DBClient } from '@web3-storage/db'

export function getTestJWT (sub = 'test-magic-issuer', name = 'test-magic-issuer') {
  return JWT.sign({ sub, iss: JWT_ISSUER, iat: 1633957389872, name }, SALT)
}
/**
 * @param {number} code
 * @returns {Promise<string>}
 */
export async function randomCid (code = pb.code) {
  const hash = await sha256.digest(Buffer.from(`${Math.random()}`))
  return CID.create(1, code, hash).toString()
}

/**
 * Create a new DB client instance from the current environment variables.
 */
export function getDBClient () {
  const token = process.env.PG_REST_JWT
  const endpoint = process.env.PG_REST_URL
  if (!token) {
    throw new Error('missing PG_REST_JWT environment var')
  }
  if (!endpoint) {
    throw new Error('missing PG_REST_URL environment var')
  }
  return new DBClient({ token, endpoint, postgres: true })
}
