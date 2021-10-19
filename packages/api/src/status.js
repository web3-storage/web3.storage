import { JSONResponse, notFound } from './utils/json-response.js'

/**
 * Returns pin and deal status info for a given CID.
 *
 * @see {@link ../test/fixtures/status.json|Example response}
 * @param {Request} request
 * @param {import('./env').Env} env
 * @returns {Response}
 */
export async function statusGet (request, env) {
  const cid = request.params.cid
  const res = await env.db.getStatus(cid)

  if (!res) {
    return notFound()
  }

  return new JSONResponse(res)
}
