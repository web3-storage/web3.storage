import pg from 'pg'
import { Cluster } from '@nftstorage/ipfs-cluster'
import { DBClient } from '@web3-storage/db'

export const MAX_CONCURRENT_QUERIES = 10

/**
 * Create a new IPFS Cluster instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
export function getCluster (env) {
  const clusterApiUrl = env.CLUSTER_API_URL
  if (!clusterApiUrl) throw new Error('missing CLUSTER_API_URL environment var')
  const basicAuthToken = env.CLUSTER_BASIC_AUTH_TOKEN
  return new Cluster(clusterApiUrl, {
    headers: basicAuthToken ? { Authorization: `Basic ${basicAuthToken}` } : {}
  })
}

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

/**
 * Create a new Postgres client instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 * @param {'ro'|'rw'} [mode]
 */
export function getPg (env, mode) {
  return new pg.Client({ connectionString: getPgConnString(env, mode) })
}

/**
 * Create a new Postgres pool instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 * @param {'ro'|'rw'} [mode]
 */
export function getPgPool (env, mode = 'rw') {
  return new pg.Pool({
    connectionString: getPgConnString(env, mode),
    max: MAX_CONCURRENT_QUERIES
  })
}

/**
 * Get a postgres connection string from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 * @param {'ro'|'rw'} [mode]
 */
function getPgConnString (env, mode = 'rw') {
  let connectionString
  if (env.ENV === 'production') {
    connectionString =
      mode === 'rw'
        ? env.PROD_PG_CONNECTION
        : env.PROD_RO_PG_CONNECTION
  } else if (env.ENV === 'staging') {
    connectionString =
      mode === 'rw'
        ? env.STAGING_PG_CONNECTION
        : env.STAGING_RO_PG_CONNECTION
  } else {
    connectionString =
      mode === 'rw' ? env.PG_CONNECTION : env.RO_PG_CONNECTION
  }
  if (!connectionString) throw new Error('missing Postgres connection string')
  return connectionString
}
