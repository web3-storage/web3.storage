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

  /**
   * Creates and throws HTTPError
   *
   * @param {string} message
   * @param {number} [status]
   * @returns {never}
   */
  static throw (message, status) {
    throw new this(message, status)
  }
}

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

export class PinningUnauthorizedError extends PinningServiceApiError {
  constructor (msg = 'Pinning not authorized for this user, please visit https://web3.storage/docs/how-tos/pinning-services-api/ for instructions on how to request access.') {
    super(msg, 403)
    this.reason = PinningUnauthorizedError.CODE
  }
}
PinningUnauthorizedError.CODE = 'ERROR_PINNING_UNAUTHORIZED'

export class AccountRestrictedError extends HTTPError {
  constructor (msg = 'This account is restricted, email support@web3.storage for more information.') {
    super(msg, 403)
    this.name = 'AccountRestrictedError'
    this.code = AccountRestrictedError.CODE
  }
}
AccountRestrictedError.CODE = 'ERROR_ACCOUNT_RESTRICTED'

export class DeleteRestrictedError extends HTTPError {
  constructor (msg = 'Delete operations restricted.') {
    super(msg, 403)
    this.name = 'DeleteRestrictedError'
    this.code = DeleteRestrictedError.CODE
  }
}
DeleteRestrictedError.CODE = 'ERROR_DELETE_RESTRICTED'

export class TokenNotFoundError extends HTTPError {
  constructor (msg = 'API token no longer valid') {
    super(msg, 401)
    this.name = 'TokenNotFound'
    this.code = TokenNotFoundError.CODE
  }
}
TokenNotFoundError.CODE = 'ERROR_TOKEN_NOT_FOUND'

export class TokenBlockedError extends HTTPError {
  constructor (msg = 'API token is blocked, please contact support@web3.storage') {
    super(msg, 403)
    this.name = 'TokenBlocked'
    this.code = TokenBlockedError.CODE
  }
}
TokenBlockedError.CODE = 'ERROR_TOKEN_BLOCKED'

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

/**
 * Error indicating a new user signup was denied and probably will be indefinitely,
 * and the user should try a new product instead.
 */
export class NewUserDeniedTryOtherProductError extends HTTPError {
  /**
   * @param {string} message
   * @param {URL} otherProduct
   */
  constructor (message, otherProduct) {
    super(message, 403)
    this.code = 'NEW_USER_DENIED_TRY_OTHER_PRODUCT'
    this.otherProduct = otherProduct
  }

  toJSON () {
    return {
      message: this.message,
      code: this.code,
      otherProduct: this.otherProduct.toString()
    }
  }
}

export class AgreementsRequiredError extends HTTPError {
  /**
   * @param {import("./utils/billing-types").Agreement[]} agreements
   * @param {string} message
   */
  constructor (agreements, message = `Missing required agreements ${agreements.join(', ')}`) {
    super(message, 400)
    this.name = 'AgreementRequired'
    this.code = AgreementsRequiredError.CODE
  }
}
AgreementsRequiredError.CODE = 'AGREEMENTS_REQUIRED'

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

export class FeatureHasBeenSunsetError extends Error {
  /**
   * @param {string} reason
   */
  constructor (reason) {
    super(reason)
    this.name = 'FeatureHasBeenSunset'
    /**
     * The 410 (Gone) status code indicates that access to the target resource
     * is no longer available at the origin server and that this condition is likely
     * to be permanent.
     */
    this.status = 410 // Gone
    this.code = FeatureHasBeenSunsetError.CODE
  }
}
FeatureHasBeenSunsetError.CODE = 'ERROR_FEATURE_HAS_BEEN_SUNSET'

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

export class PSACodecNotSupported extends PinningServiceApiError {
  /**
   * @param {string} message
   */
  constructor (message = PSACodecNotSupported.MESSAGE) {
    super(message)
    this.details = message
    this.status = 400
    this.reason = PSACodecNotSupported.CODE
  }
}
PSACodecNotSupported.CODE = 'PSA_CODEC_ERROR'
PSACodecNotSupported.MESSAGE = 'IPLD codec not supported. The API supports raw, dag-pb, dag-cbor, dag-json.'

export class RangeNotSatisfiableError extends HTTPError {
  constructor (msg = 'Range Not Satisfiable') {
    super(msg, 416)
    this.name = 'RangeNotSatisfiableError'
    this.code = RangeNotSatisfiableError.CODE
  }
}
RangeNotSatisfiableError.CODE = 'ERROR_RANGE_NOT_SATISFIABLE'

export class LinkdexError extends Error {
  /**
   * @param {number} status
   * @param {number} statusText
   */
  constructor (status, statusText) {
    super(`linkdex-api not ok: ${status} ${statusText}`)
    this.name = 'LinkdexError'
    this.status = status
    this.code = LinkdexError.CODE
  }
}
LinkdexError.CODE = 'LINKDEX_NOT_OK'
