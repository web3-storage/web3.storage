/* global MAGIC_SECRET_KEY FAUNA_ENDPOINT FAUNA_KEY SALT */
import { Magic } from '@magic-sdk/admin'
import { DBClient } from '@web3-storage/db'

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
}
