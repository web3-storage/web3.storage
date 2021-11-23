import { JSONResponse } from './utils/json-response.js'
import { normalizeCid } from './utils/normalize-cid.js'

/**
 * @typedef {{ error: { reason: string, details?: string } }} PinDataError
 */

// Error messages
export const ERROR_CODE = 400
export const ERROR_STATUS = 'INVALID_PIN_DATA'
export const INVALID_CID = 'Invalid cid'
export const INVALID_MATCH = 'Match should be a string (i.e. "exact", "iexact", "partial", "ipartial")'
export const INVALID_META = 'Meta should be an object with string values'
export const INVALID_NAME = 'Name should be a string'
export const INVALID_ORIGINS = 'Origins should be an array of strings'
export const INVALID_REQUEST_ID = 'Request id should be a string'
export const INVALID_STATUS = 'Status should be an array of strings'
export const REQUIRED_CID = 'CID is required'
export const REQUIRED_REQUEST_ID = 'Request id is required'
export const UNPERMITTED_MATCH = 'Match should be "exact", "iexact", "partial", or "ipartial"'
export const UNPERMITTED_STATUS = 'Status should be "queued", "pinning", "pinned", or "failed"'

const MATCH_OPTIONS = ['exact', 'iexact', 'partial', 'ipartial']
const STATUS_OPTIONS = ['queued', 'pinning', 'pinned', 'failed']

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinPost (request, env, ctx) {
  const { cid, name, origins, meta } = await request.json()

  // Require cid
  if (!cid) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: REQUIRED_CID } },
      { status: ERROR_CODE }
    )
  }

  try {
    const normalizedCid = normalizeCid(cid)
  } catch (err) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_CID } },
      { status: ERROR_CODE }
    )
  }

  // Validate name
  if (name && typeof name !== 'string') {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_NAME } },
      { status: ERROR_CODE }
    )
  }

  // Validate origins
  if (origins && !Array.isArray(origins)) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_ORIGINS } },
      { status: ERROR_CODE }
    )
  }

  // Validate meta
  if (meta) {
    if (typeof meta !== 'object' || Array.isArray(meta) || Object.entries(meta).some(([, v]) => typeof v !== 'string')) {
      return new JSONResponse(
        { error: { reason: ERROR_STATUS, details: INVALID_META } },
        { status: ERROR_CODE }
      )
    }
  }

  // TODO: write logic for pinning cid
  return new JSONResponse('OK')
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinGet (request, env, ctx) {
  const requestId = request.params.requestId

  if (!requestId) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: REQUIRED_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  if (typeof requestId !== 'string') {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  // TODO: write logic for getting pin
  return new JSONResponse('OK')
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinsGet (request, env, ctx) {
  const { cid, name, match, status } = request.params

  // Normalize cid
  if (cid) {
    try {
      const normalizedCid = normalizeCid(cid)
    } catch (err) {
      return new JSONResponse(
        { error: { reason: ERROR_STATUS, details: INVALID_CID } },
        { status: ERROR_CODE }
      )
    }
  }

  // Validate name
  if (name && typeof name !== 'string') {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_NAME } },
      { status: ERROR_CODE }
    )
  }

  // Validate match
  if (match && typeof match !== 'string') {
    if (!MATCH_OPTIONS.includes(match)) {
      return new JSONResponse(
        { error: { reason: ERROR_STATUS, details: UNPERMITTED_MATCH } },
        { status: ERROR_CODE }
      )
    }

    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_MATCH } },
      { status: ERROR_CODE }
    )
  }

  // Validate status
  if (status && !Array.isArray(status)) {
    const isValidStatus = status.every(v => STATUS_OPTIONS.includes(v))
    if (!isValidStatus) {
      return new JSONResponse(
        { error: { reason: ERROR_STATUS, details: UNPERMITTED_STATUS } },
        { status: ERROR_CODE }
      )
    }

    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_STATUS } },
      { status: ERROR_CODE }
    )
  }

  // TODO: write logic for listing pins
  return new JSONResponse('OK')
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinDelete (request, env, ctx) {
  const requestId = request.params.requestId

  if (!requestId) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: REQUIRED_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  if (typeof requestId !== 'string') {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  // TODO: write logic for deleting pin request
  return new JSONResponse('OK')
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinReplace (request, env, ctx) {
  throw new Error('Not implemented')
}
