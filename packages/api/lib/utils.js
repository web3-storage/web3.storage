import { DBClient } from '@web3-storage/db'

/**
 * Create a new DB client instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
export function getDBClient (env) {
  const token = env.PG_REST_JWT
  const endpoint = env.PG_REST_URL
  if (!token) {
    throw new Error('missing PG_REST_JWT environment var')
  }
  if (!endpoint) {
    throw new Error('missing PG_REST_URL environment var')
  }
  return new DBClient({ token, endpoint, postgres: true })
}
