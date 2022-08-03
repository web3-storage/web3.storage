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
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: `Basic: ${apiKey}`
  }
  const body = await request.json();
  const userExists = isChimpUser(body.email, prefix, listId, headers)
  let res

  if(userExists) {
    res = await updateSubscriber(body.email, prefix, listId, headers)
  } else {
    res = await addSubscriber(body.email, prefix, listId, headers)
  }

  if(res.ok) {
    return new JSONResponse({
      ok: true
    })
  }

  return new JSONResponse({
    ok: false,
    message: 'Error: Unable to subscribe user.'
  })
}
