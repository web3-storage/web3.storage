/**
 *  @param {string} email
 *  @param {string} prefix
 *  @param {string} listId
 *  @param {object} headers
 */
export const isChimpUser = async (email, prefix, listId, headers) => {
  const url = `https://${prefix}.api.mailchimp.com/3.0/lists/${listId}/members/${encodeURIComponent(
    email
  )}`
  const res = await fetch(url, {
    method: 'GET',
    headers
  })
  return res.ok
}

/**
 *  @param {string} email
 *  @param {string} prefix
 *  @param {string} listId
 *  @param {object} headers
 */
export const addSubscriber = async (email, prefix, listId, headers) => {
  const url = `https://${prefix}.api.mailchimp.com/3.0/lists/${listId}/members/`
  const body = JSON.stringify({
    email_address: email,
    status: 'subscribed',
    tags: ['web3_blog_subscriber']
  })

  return await fetch(url, {
    method: 'POST',
    headers,
    body
  })
}

/**
 *  @param {string} email
 *  @param {string} prefix
 *  @param {string} listId
 *  @param {object} headers
 */
export const updateSubscriber = async (email, prefix, listId, headers) => {
  const url = `https://${prefix}.api.mailchimp.com/3.0/lists/${listId}/members/${encodeURIComponent(
    email
  )}/tags`
  const body = JSON.stringify({
    tags: [{ name: 'web3_blog_subscriber', status: 'active' }]
  })

  return await fetch(url, {
    method: 'POST',
    headers,
    body
  })
}
