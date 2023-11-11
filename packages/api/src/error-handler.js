import { ErrorCode as MagicErrors } from '@magic-sdk/admin'
import { JSONResponse } from './utils/json-response.js'
import { HTTPError, PinningServiceApiError } from './errors.js'

/**
 * @param {Error & {status?: number;code?: string;reason?: string; details?: string; }} err
 * @param {import('./env').Env} env
 * @param {Request} request
 */
export function errorHandler (err, { log }, request) {
  console.error(err)

  let status = err.status || 500
  if (status >= 500) {
    log.error(err)
  }

  // As the pinning service requires a certain specification
  // Always return the nested error object for any pinning service endpoints
  const requestUrl = new URL(request.url)
  if (err instanceof PinningServiceApiError || /^\/pins/.test(requestUrl.pathname)) {
    const error = {
      error: {
        reason: err.reason || err.code,
        details: err.details || err.message
      }
    }
    return new JSONResponse(error, { status })
  }

  let error = {
    code: err.code,
    message: err.message
  }

  if (err instanceof HTTPError) {
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
