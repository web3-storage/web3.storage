import { ErrorCode as MagicErrors } from '@magic-sdk/admin'
import { JSONResponse } from './utils/json-response.js'
import { HTTPError } from './errors.js'

/**
 * @param {Error & {status?: number;code?: string;}} err
 * @param {import('./env').Env} env
 */
export function errorHandler (err, env) {
  console.error('-->errorHandler: ', err)
  let code = err.code || 'HTTP_ERROR'
  let message = err.message
  let status = err.status || 500

  switch (err.code) {
    // Magic SDK errors
    case MagicErrors.TokenExpired:
      status = 401
      message = 'API token has expired.'
      break
    case MagicErrors.ExpectedBearerString:
      status = 401
      message = 'API token is missing, make sure the `Authorization` header has a value in the following format `Bearer {token}`.'
      break
    case MagicErrors.MalformedTokenError:
      status = 401
      message = 'API token is malformed or failed to parse.'
      break
    case MagicErrors.TokenCannotBeUsedYet:
    case MagicErrors.IncorrectSignerAddress:
    case MagicErrors.FailedRecoveryProof:
    case MagicErrors.ApiKeyMissing:
      status = 401
      code = 'AUTH_ERROR'
      message = 'Authentication failed.'
      break
    case MagicErrors.ServiceError:
      status = 500
      code = 'SERVER_ERROR'
      break
    default:
      if (status >= 500) {
        code = err.name
        message = err.message
      }
      break
  }

  return HTTPError.respond(err)
}
