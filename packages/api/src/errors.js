export class HTTPError extends Error {
  /**
   *
   * @param {string} message
   * @param {number} [status]
   */
  constructor (message, status = 500) {
    super(message)
    this.name = 'HTTPError'
    this.status = status
  }
}

export class UserNotFoundError extends HTTPError {
  constructor (msg = 'User not found.') {
    super(msg, 401)
    this.name = 'UserNotFound'
    this.code = UserNotFoundError.CODE
  }
}

UserNotFoundError.CODE = 'ERROR_USER_NOT_FOUND'

export class TokenNotFoundError extends HTTPError {
  constructor (msg = 'API token not found.') {
    super(msg, 401)
    this.name = 'TokenNotFound'
    this.code = TokenNotFoundError.CODE
  }
}

TokenNotFoundError.CODE = 'ERROR_TOKEN_NOT_FOUND'
