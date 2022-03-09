import pg from 'pg'
import { Cluster } from '@nftstorage/ipfs-cluster'
import { DBClient } from '@web3-storage/db'
import { IPFS } from './ipfs.js'

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
 * Create a new IPFS client instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
export function getClusterIPFSProxy (env) {
  const ipfsApiUrl = env.CLUSTER_IPFS_PROXY_API_URL
  if (!ipfsApiUrl) throw new Error('missing CLUSTER_IPFS_PROXY_API_URL environment var')
  const basicAuthToken = env.CLUSTER_IPFS_PROXY_BASIC_AUTH_TOKEN
  return new IPFS(ipfsApiUrl, {
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
    if (!env.PG_REST_JWT) throw new Error('missing PG_REST_JWT environment var')
    if (!env.PG_REST_URL) throw new Error('missing PG_REST_URL environment var')
    token = env.PG_REST_JWT
    endpoint = env.PG_REST_URL
  } else if (env.ENV === 'staging') {
    if (!env.STAGING_PG_REST_JWT) throw new Error('missing STAGING_PG_REST_JWT environment var')
    if (!env.STAGING_PG_REST_URL) throw new Error('missing STAGING_PG_REST_URL environment var')
    token = env.STAGING_PG_REST_JWT
    endpoint = env.STAGING_PG_REST_URL
  } else if (env.ENV === 'dev') {
    if (!env.DEV_PG_REST_JWT) throw new Error('missing DEV_PG_REST_JWT environment var')
    if (!env.DEV_PG_REST_URL) throw new Error('missing DEV_PG_REST_URL environment var')
    token = env.DEV_PG_REST_JWT
    endpoint = env.DEV_PG_REST_URL
  } else {
    throw new Error(`unsupported environment ${env.ENV}`)
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
