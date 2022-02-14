import { ErrorCode as MagicErrors } from '@magic-sdk/admin'
import { JSONResponse } from './utils/json-response.js'
import { HTTPError } from './errors.js'

/**
 * @param {Error & {status?: number;code?: string;reason?: string; details?: string; IS_PSA_ERROR?: boolean;}} err
 * @param {import('./env').Env} env
 */
export function errorHandler (err, { sentry }) {
  console.error(err.stack)

  let status = err.status || 500

  if (sentry && status >= 500) {
    sentry.captureException(err)
  }

  // TODO: improve error handler
  // https://github.com/web3-storage/web3.storage/issues/976
  if (err.IS_PSA_ERROR) {
    const error = {
      reason: err.reason,
      details: err.details
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
