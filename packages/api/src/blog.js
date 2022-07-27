import { JSONResponse } from './utils/json-response.js'

let prefix, listId, apiKey, token, headers

/**
 *  @param {string} email
 */
export const isChimpUser = async (email) => {
  const url = `https://${prefix}.api.mailchimp.com/3.0/lists/${listId}/members/${encodeURIComponent(
    email
  )}`
  const res = await fetch(url, {
    method: 'GET',
    headers,
  })
  return res.ok
}

/**
 *  @param {string} email
 */
export const addSubscriber = async (email) => {
  const url = `https://${prefix}.api.mailchimp.com/3.0/lists/${listId}/members/`
  const body = JSON.stringify({
    email_address: email,
    status: 'subscribed',
    tags: ['web3_blog_subscriber'],
  })

  return await fetch(url, {
    method: 'POST',
    headers,
    body,
  })
}

/**
 *  @param {string} email
 */
const updateSubscriber = async (email) => {
  const url = `https://${prefix}.api.mailchimp.com/3.0/lists/${listId}/members/${encodeURIComponent(
    email
  )}/tags`
  const body = JSON.stringify({
    tags: [{ name: 'web3_blog_subscriber', status: 'active' }],
  })

  return await fetch(url, {
    method: 'POST',
    headers,
    body,
  })
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<JSONResponse>}
 */
export async function blogSubscriptionCreate (request, env, ctx) {
  prefix = env.MAILCHIMP_API_PREFIX
  listId = env.MAILCHIMP_BLOG_LIST_ID
  apiKey = env.MAILCHIMP_API_KEY
  token = btoa(`:${apiKey}`)
  headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: `Basic ${token}`,
  }

  const body = await request.json();
  (await isChimpUser(body.email))
    ? await updateSubscriber(body.email)
    : await addSubscriber(body.email)
  return new JSONResponse({
    ok: true,
  })
}
