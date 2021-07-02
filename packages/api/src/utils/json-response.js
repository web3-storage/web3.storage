export class JSONResponse extends Response {
  /**
   * @param {BodyInit} body
   * @param {ResponseInit} [init]
   */
  constructor (body, init = {}) {
    init.headers = init.headers || {}
    init.headers['Content-Type'] = 'application/json;charset=UTF-8'
    super(JSON.stringify(body), init)
  }
}
