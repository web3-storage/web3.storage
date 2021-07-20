import { ErrorCode as MagicErrors } from '@magic-sdk/admin'
import { JSONResponse } from './utils/json-response.js'

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
   * @param {Error & {status?: number;code?: string;}} err
   * @param {import('./env').Env} env
   */
  static respond (err, { sentry }) {
    let error = {
      code: err.code,
      message: err.message
    }
    let status = err.status || 500

    switch (err.code) {
      case UserNotFoundError.CODE:
      case TokenNotFoundError.CODE:
        break

      // Magic SDK errors
      case MagicErrors.TokenExpired:
        status = 401
        error.message = 'API token has expired.'
        break
      case MagicErrors.ExpectedBearerString:
        status = 401
        error.message =
          'API token is missing, make sure the `Authorization` header has a value in the following format `Bearer {token}`.'
        break
      case MagicErrors.MalformedTokenError:
        status = 401
        error.message = 'API token is malformed or failed to parse.'
        break
      case MagicErrors.TokenCannotBeUsedYet:
      case MagicErrors.IncorrectSignerAddress:
      case MagicErrors.FailedRecoveryProof:
      case MagicErrors.ApiKeyMissing:
        status = 401
        error.code = 'AUTH_ERROR'
        error.message = 'Authentication failed.'
        sentry && sentry.captureException(err)
        break
      case MagicErrors.ServiceError:
        status = 500
        error.code = 'SERVER_ERROR'
        sentry && sentry.captureException(err)
        break
      default:
        // catch all server errors
        if (status >= 500) {
          error = {
            code: err.name,
            message: err.message || 'Server Error'
          }
          sentry && sentry.captureException(err)
        } else {
          // Custom HTTPError
          error = {
            code: err.code || 'HTTP_ERROR',
            message: err.message || 'Server Error'
          }
        }
        break
    }

    return new JSONResponse(error, { status })
  }
}

export class UserNotFoundError extends Error {
  constructor (msg = 'User not found.') {
    super(msg)
    this.name = 'UserNotFound'
    this.status = 401
    this.code = UserNotFoundError.CODE
  }
}

UserNotFoundError.CODE = 'ERROR_USER_NOT_FOUND'

export class TokenNotFoundError extends Error {
  constructor (msg = 'API token not found.') {
    super(msg)
    this.name = 'TokenNotFound'
    this.status = 401
    this.code = TokenNotFoundError.CODE
  }
}

TokenNotFoundError.CODE = 'ERROR_TOKEN_NOT_FOUND'
