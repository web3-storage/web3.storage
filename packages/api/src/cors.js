/* eslint-env serviceworker */
/**
 * @param {Request} request
 * @returns {Response}
 */
export function corsOptions (request) {
  const headers = request.headers
  // Make sure the necessary headers are present for this to be a valid pre-flight request
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    /** @type {Record<string, string>} */
    const respHeaders = {
      'Content-Length': '0',
      'Access-Control-Allow-Origin': headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Max-Age': '86400',
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      'Access-Control-Allow-Headers':
        headers.get('Access-Control-Request-Headers') || '',
      'Access-Control-Expose-Headers': 'Link'
    }

    return new Response(null, {
      status: 204,
      headers: respHeaders
    })
  } else {
    return new Response('Non CORS options request not allowed', {
      status: 405,
      statusText: 'Method Not Allowed'
    })
  }
}

/**
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withCorsHeaders (handler) {
  /**
   * @param {Request} request
   * @returns {Response}
   */
  return async (request, ...rest) => {
    const response = await handler(request, ...rest)
    return addCorsHeaders(request, response)
  }
}

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Response}
 */
export function addCorsHeaders (request, response) {
  // Clone the response so that it's no longer immutable (like if it comes from cache or fetch)
  response = new Response(response.body, response)
  const origin = request.headers.get('origin')
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Vary', 'Origin')
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }
  response.headers.set('Access-Control-Expose-Headers', 'Link')
  return response
}
