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
  constructor (msg = 'No user found for user token') {
    super(msg, 401)
    this.name = 'UserNotFound'
    this.code = UserNotFoundError.CODE
  }
}
UserNotFoundError.CODE = 'ERROR_USER_NOT_FOUND'

export class TokenNotFoundError extends HTTPError {
  constructor (msg = 'API token no longer valid') {
    super(msg, 401)
    this.name = 'TokenNotFound'
    this.code = TokenNotFoundError.CODE
  }
}
TokenNotFoundError.CODE = 'ERROR_TOKEN_NOT_FOUND'

export class UnrecognisedTokenError extends HTTPError {
  constructor (msg = 'Could not parse provided API token') {
    super(msg, 401)
    this.name = 'UnrecognisedToken'
    this.code = UnrecognisedTokenError.CODE
  }
}
UnrecognisedTokenError.CODE = 'ERROR_UNRECOGNISED_TOKEN'

export class NoTokenError extends HTTPError {
  constructor (msg = 'No token found in `Authorization: Bearer ` header') {
    super(msg, 401)
    this.name = 'NoToken'
    this.code = NoTokenError.CODE
  }
}
NoTokenError.CODE = 'ERROR_NO_TOKEN'

export class MagicTokenRequiredError extends HTTPError {
  constructor (msg = 'Must be logged in with magic.link') {
    super(msg, 401)
    this.name = 'MagicTokenRequired'
    this.code = MagicTokenRequiredError.CODE
  }
}
MagicTokenRequiredError.CODE = 'ERROR_MAGIC_TOKEN_REQUIRED'

export class InvalidCidError extends Error {
  /**
   * @param {string} cid
   */
  constructor (cid) {
    super(`Invalid CID: ${cid}`)
    this.name = 'InvalidCid'
    this.status = 400
    this.code = InvalidCidError.CODE
  }
}
InvalidCidError.CODE = 'ERROR_INVALID_CID'
