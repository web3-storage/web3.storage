import { Cluster } from '@nftstorage/ipfs-cluster'
import { DBClient } from '@web3-storage/db'
import { IPFS } from './ipfs.js'

/**
 * Create a new IPFS Cluster instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
export function getCluster (env) {
  const clusterApiUrl = env.CLUSTER_API_URL
  if (!clusterApiUrl) throw new Error('missing IPFS Cluster API URL')
  const basicAuthToken = env.CLUSTER_BASIC_AUTH_TOKEN
  if (!basicAuthToken) throw new Error('missing IPFS Cluster credentials')
  return new Cluster(clusterApiUrl, {
    headers: { Authorization: `Basic ${basicAuthToken}` }
  })
}

/**
 * Create a new IPFS client instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
export function getClusterIPFSProxy (env) {
  const ipfsApiUrl = env.CLUSTER_IPFS_PROXY_API_URL
  if (!ipfsApiUrl) throw new Error('missing IPFS API URL')
  const basicAuthToken = env.CLUSTER_BASIC_AUTH_TOKEN
  if (!basicAuthToken) throw new Error('missing IPFS Cluster credentials')
  return new IPFS(ipfsApiUrl, {
    headers: { Authorization: `Basic ${basicAuthToken}` }
  })
}

/**
 * Create a new Fauna DB client instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
export function getDBClient (env) {
  let token
  if (env.ENV === 'production') {
    if (!env.FAUNA_KEY) throw new Error('missing production Fauna token')
    token = env.FAUNA_KEY
  } else if (env.ENV === 'staging') {
    if (!env.STAGING_FAUNA_KEY) throw new Error('missing staging Fauna token')
    token = env.STAGING_FAUNA_KEY
  } else {
    throw new Error(`unsupported environment ${env.ENV}`)
  }
  return new DBClient({ token })
}
