import { Magic } from '@magic-sdk/admin'
import { DBClient } from '@web3-storage/db'
import { Cluster } from '@nftstorage/ipfs-cluster'
import { FAUNA_ENDPOINT as FAUNA_DEFAULT_ENDPOINT } from './constants.js'

/** @typedef {{ magic: Magic, db: DBClient, SALT: string }} Env */

/**
 * @param {Request} _
 * @param {Env} env
 */
export function envAll (_, env) {
  env.magic = new Magic(env.MAGIC_SECRET_KEY || MAGIC_SECRET_KEY)

  env.db = new DBClient({
    endpoint: env.FAUNA_ENDPOINT || FAUNA_ENDPOINT || FAUNA_DEFAULT_ENDPOINT,
    token: env.FAUNA_KEY || FAUNA_KEY
  })

  env.SALT = env.SALT || SALT

  env.cluster = new Cluster(env.CLUSTER_API_URL || CLUSTER_API_URL, {
    headers: { Authorization: `Basic ${env.CLUSTER_BASIC_AUTH_TOKEN || CLUSTER_BASIC_AUTH_TOKEN}` }
  })
}
