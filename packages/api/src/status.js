import { JSONResponse, notFound } from './utils/json-response.js'
import { normalizeCid } from './utils/cid.js'

/**
 * Returns pin and deal status info for a given CID.
 *
 * @see {@link ../test/fixtures/status.json|Example response}
 * @param {Request} request
 * @param {import('./env').Env} env
 * @returns {Promise<Response>}
 */
export async function statusGet (request, env) {
  // @ts-ignore
  const cid = request.params.cid
  const normalizedCid = normalizeCid(cid)
  const res = await env.db.getStatus(normalizedCid)

  if (!res) {
    return notFound()
  }

  // replace content cid for source cid in response
  res.cid = cid

  return new JSONResponse(res)
}
