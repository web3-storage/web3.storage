/* global MAGIC_SECRET_KEY FAUNA_ENDPOINT FAUNA_KEY SALT CLUSTER_BASIC_AUTH_TOKEN CLUSTER_API_URL */
import { Magic } from '@magic-sdk/admin'
import { DBClient } from '@web3-storage/db'
import { Cluster } from '@nftstorage/ipfs-cluster'

/** @typedef {{ magic: Magic, db: DBClient, SALT: string }} Env */

/**
 * @param {Request} _
 * @param {Env} env
 */
export function envAll (_, env) {
  env.magic = new Magic(env.MAGIC_SECRET_KEY || MAGIC_SECRET_KEY)

  env.db = new DBClient({
    endpoint: env.FAUNA_ENDPOINT || (typeof FAUNA_ENDPOINT === 'undefined' ? undefined : FAUNA_ENDPOINT),
    token: env.FAUNA_KEY || FAUNA_KEY
  })

  env.SALT = env.SALT || SALT

  const clusterAuthToken = env.CLUSTER_BASIC_AUTH_TOKEN || (typeof CLUSTER_BASIC_AUTH_TOKEN === 'undefined' ? undefined : CLUSTER_BASIC_AUTH_TOKEN)
  const headers = clusterAuthToken ? { Authorization: `Basic ${clusterAuthToken}` } : {}
  env.cluster = new Cluster(env.CLUSTER_API_URL || CLUSTER_API_URL, { headers })
}
