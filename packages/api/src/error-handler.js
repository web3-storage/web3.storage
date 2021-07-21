import { ErrorCode as MagicErrors } from '@magic-sdk/admin'
import { JSONResponse } from './utils/json-response.js'
import { HTTPError, UserNotFoundError, TokenNotFoundError } from './errors.js'

/**
 * @param {Error & {status?: number;code?: string;}} err
 */
export function errorHandler (err) {
  let error = {
    code: err.code,
    message: err.message
  }
  let status = err.status || 500

  if (err instanceof HTTPError) {
    return new JSONResponse(error, { status })
  }

  if (err instanceof UserNotFoundError || err instanceof TokenNotFoundError) {
    return new JSONResponse(error, { status })
  }

  switch (err.code) {
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
      break
    case MagicErrors.ServiceError:
      status = 500
      error.code = 'SERVER_ERROR'
      break
    default:
      // Custom HTTPError
      error = {
        code: err.code || 'HTTP_ERROR',
        message: err.message || 'Server Error'
      }
      break
  }

  return new JSONResponse(error, { status })
}
