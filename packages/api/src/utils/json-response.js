/* eslint-env serviceworker */

// TODO: move this to pin.js
/**
 * @typedef {{ error: { reason: string, details?: string } }} PinDataError
 */

export class JSONResponse extends Response {
  /**
   * @param {BodyInit | PinDataError} body
   * @param {ResponseInit} [init]
   */
  constructor (body, init = {}) {
    init.headers = init.headers || {}
    init.headers['Content-Type'] = 'application/json;charset=UTF-8'
    super(JSON.stringify(body), init)
  }
}

export function notFound (message = 'Not Found') {
  return new JSONResponse({ message }, { status: 404 })
}
