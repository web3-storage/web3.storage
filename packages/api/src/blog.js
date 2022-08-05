import { JSONResponse } from './utils/json-response.js'

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<JSONResponse>}
 */
export async function blogSubscriptionCreate (request, env, ctx) {
  const requestData = await request.json()
  const { email } = requestData

  // placeholder for actual subscribe logic

  return new JSONResponse({ email }, { status: 202 })
}
