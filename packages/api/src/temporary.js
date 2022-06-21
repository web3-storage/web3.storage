import { HTTPError, PinningServiceApiError } from './errors.js'
import { JSONResponse } from './utils/json-response.js'

/** We have previously seen a bug where on a Cloudflare Worker
 *     `err instanceof PinningServiceApiError`
 * was true for any `err` which was a subclass of `Error`. But locally and in the CI it
 * behaved as expected.
 * We suspect that this problem may now have been fixed now that we've changed our worker
 * to an ES6 module. So this view function is to allow us to test whether this problem
 * still occurs on Cloudflare or not.
 */
export function cloudflareInstanceofTest (request, env) {
  const httpError = new HTTPError('I am an HTTP error')
  const bugExhibited = httpError instanceof PinningServiceApiError
  const data = { bugExhibited }
  return new JSONResponse(data)
}
