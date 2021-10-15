import { JSONResponse } from './utils/json-response.js'

/**
 * Get web3.storage API version information.
 *
 * @param {Request} request
 * @param {import('./env').Env} env
 */
export async function versionGet (request, env) {
  return new JSONResponse({
    version: env.VERSION,
    commit: env.COMMITHASH,
    branch: env.BRANCH,
    mode: env.MODE
  })
}
