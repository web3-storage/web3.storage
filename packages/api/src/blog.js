import { JSONResponse } from './utils/json-response.js'
import { isChimpUser, updateSubscriber, addSubscriber } from './utils/mailchimp.js'

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<JSONResponse>}
 */
export async function blogSubscriptionCreate (request, env, ctx) {
  const prefix = env.MAILCHIMP_API_PREFIX
  const listId = env.MAILCHIMP_BLOG_LIST_ID
  const apiKey = env.MAILCHIMP_API_KEY
  const token = btoa(`:${apiKey}`)
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: `Basic ${token}`,
  }

  const body = await request.json();
  (await isChimpUser(body.email, prefix, listId, headers))
    ? await updateSubscriber(body.email, prefix, listId, headers)
    : await addSubscriber(body.email, prefix, listId, headers)
  return new JSONResponse({
    ok: true,
  })
}
