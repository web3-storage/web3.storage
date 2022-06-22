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
  let token, endpoint
  if (env.ENV === 'production') {
    if (!env.PROD_PG_REST_JWT) throw new Error('missing PROD_PG_REST_JWT environment var')
    if (!env.PROD_PG_REST_URL) throw new Error('missing PROD_PG_REST_URL environment var')
    token = env.PROD_PG_REST_JWT
    endpoint = env.PROD_PG_REST_URL
  } else if (env.ENV === 'staging') {
    if (!env.STAGING_PG_REST_JWT) throw new Error('missing STAGING_PG_REST_JWT environment var')
    if (!env.STAGING_PG_REST_URL) throw new Error('missing STAGING_PG_REST_URL environment var')
    token = env.STAGING_PG_REST_JWT
    endpoint = env.STAGING_PG_REST_URL
  } else if (env.ENV === 'dev') {
    if (!env.PG_REST_JWT) throw new Error('missing PG_REST_JWT environment var')
    if (!env.PG_REST_URL) throw new Error('missing PG_REST_URL environment var')
    token = env.PG_REST_JWT
    endpoint = env.PG_REST_URL
  } else {
    throw new Error(`unsupported environment ${env.ENV}`)
  }
  return new DBClient({ token, endpoint, postgres: true })
}

/**
 * Create a new Postgres client instance from the passed environment variables and connects to it.
 * @param {Record<string, string|undefined>} env
 * @param {'ro'|'rw'} [mode]
 */
export async function getPg (env, mode) {
  const client = new pg.Client({ connectionString: getPgConnString(env, mode) })
  await client.connect()
  return client
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

/**
 * Create a new Postgres pool instance to connect directly to cargo replica from the passed environment variables.
 * This is a readOnly connection.
 *
 * A direct connection to Cargo proved to be more performant than going through FDW.
 * This hasn't been thoroughly investigated or audited.
 *
 * @param {Record<string, string|undefined>} env
 */
export function getCargoPgPool (env) {
  const connection = env.CARGO_PG_CONNECTION
  if (!connection) {
    throw new Error('Missing CARGO_PG_CONNECTION string. Please add it to the environment.')
  }

  return new pg.Pool({
    connectionString: env.CARGO_PG_CONNECTION,
    max: MAX_CONCURRENT_QUERIES
  })
}
