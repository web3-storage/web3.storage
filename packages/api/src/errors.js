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

export class PinningUnauthorizedError extends HTTPError {
  constructor (msg = 'Pinning not authorized for this user, email support@web3.storage to request authorization.') {
    super(msg, 403)
    this.name = 'PinningUnauthorizedError'
    this.code = PinningUnauthorizedError.CODE
  }
}
PinningUnauthorizedError.CODE = 'ERROR_PINNING_UNAUTHORIZED'

export class AccountRestrictedError extends HTTPError {
  constructor (msg = 'This account is restricted.') {
    super(msg, 403)
    this.name = 'AccountRestrictedError'
    this.code = AccountRestrictedError.CODE
  }
}
AccountRestrictedError.CODE = 'ERROR_ACCOUNT_RESTRICTED'

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

export class InvalidCarError extends Error {
  /**
   * @param {string} reason
   */
  constructor (reason) {
    super(`Invalid CAR file received: ${reason}`)
    this.name = 'InvalidCar'
    this.status = 400
    this.code = InvalidCarError.CODE
  }
}
InvalidCarError.CODE = 'ERROR_INVALID_CAR'

export class MaintenanceError extends Error {
  /**
   * @param {string} reason
   */
  constructor (reason) {
    super(reason)
    this.name = 'Maintenance'
    this.status = 503
    this.code = MaintenanceError.CODE
  }
}
MaintenanceError.CODE = 'ERROR_MAINTENANCE'

export class PinningServiceApiError extends Error {
  /**
   *
   * @param {string} [message]
   * @param {number} [status]
   * @param {string} code
   */
  constructor (message, status = 400, code = 'PSA_ERROR') {
    super(message)
    this.details = message
    this.status = status
    this.reason = code
    // TODO: improve error handler
    // https://github.com/web3-storage/web3.storage/issues/976
    this.IS_PSA_ERROR = true
  }
}

export class PSAErrorInvalidData extends PinningServiceApiError {
  /**
   * @param {string} message
   */
  constructor (message = 'Some data is invalid. Please consult the spec.') {
    super(message)
    this.details = message
    this.reason = PSAErrorInvalidData.CODE
  }
}
PSAErrorInvalidData.CODE = 'PSA_INVALID_DATA'

export class PSAErrorRequiredData extends PinningServiceApiError {
  /**
   * @param {string} message
   */
  constructor (message = 'Missing required data. Please consult the spec.') {
    super(message)
    this.details = message
    this.reason = PSAErrorRequiredData.CODE
  }
}
PSAErrorRequiredData.CODE = 'PSA_REQUIRED_DATA'

export class PSAErrorResourceNotFound extends PinningServiceApiError {
  /**
   * @param {string} message
   */
  constructor (message = 'Requested data was not found.') {
    super(message)
    this.details = message
    this.status = 404
    this.reason = PSAErrorResourceNotFound.CODE
  }
}
PSAErrorResourceNotFound.CODE = 'PSA_RESOURCE_NOT_FOUND'

export class PSAErrorDB extends PinningServiceApiError {
  /**
   * @param {string} message
   */
  constructor (message = 'DB transaction failed.') {
    super(message)
    this.details = message
    this.status = 500
    this.reason = PSAErrorDB.CODE
  }
}
PSAErrorDB.CODE = 'PSA_DB_ERROR'
