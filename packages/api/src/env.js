import { Magic } from '@magic-sdk/admin'
import { DBClient } from '@web3-storage/db'

/** @typedef {{ magic: Magic, db: DBClient, SALT: string }} Env */

/**
 * @param {Request} _
 * @param {Env} env
 */
export function envAll (_, env) {
  const getConfig = s => env[s] || globalThis[s]

  env.magic = new Magic(getConfig('MAGIC_SECRET_KEY'))

  env.db = new DBClient({
    endpoint: getConfig('FAUNA_ENDPOINT'),
    token: getConfig('FAUNA_KEY')
  })

  env.SALT = getConfig('SALT')
}
