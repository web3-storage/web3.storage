import { JSONResponse, notFound } from './utils/json-response.js'
import { normalizeCid } from './utils/normalize-cid.js'
import { getPins, PIN_OK_STATUS, waitAndUpdateOkPins } from './utils/pin.js'

/**
 * @typedef {'queued' | 'pinning' | 'failed' | 'pinned'} apiPinStatus
 */

/**
 *
 * Service API Pin object definition
 * @typedef {Object} ServiceApiPin
 * @property {string} cid
 * @property {string} [name]
 * @property {Array.<string>} [origins]
 * @property {object} [meta]
 */

/**
 *
 * Service API Pin Status definition
 * @typedef {Object} ServiceApiPinStatus
 * @property {string} requestId
 * @property {apiPinStatus} status
 * @property {string} created
 * @property {Array<string>} delegates
 * @property {string} [info]
 *
 * @property {ServiceApiPin} pin
 */

/**
 * @typedef {{ error: { reason: string, details?: string } }} PinDataError
 */

/**
 *
 * @param {import('../../db/db-client-types.js').PinItemOutput[]} pins
 * @return {apiPinStatus} status
 */
export const getPinningAPIStatus = (pins) => {
  const pinStatuses = pins.map((p) => p.status)

  // TODO what happens with Sharded? I'd assumed is pinned?

  if (pinStatuses.includes('Pinned')) {
    return 'pinned'
  }

  if (pinStatuses.includes('Pinning')) {
    return 'pinning'
  }

  if (pinStatuses.includes('PinQueued') ||
      pinStatuses.includes('Remote')) {
    return 'queued'
  }

  // TODO after some time if there are no pins we should give up and return a failed
  // status instead

  return 'failed'
}

// Error messages
// TODO: Refactor errors
export const ERROR_CODE = 400
export const ERROR_STATUS = 'INVALID_PIN_DATA'
export const INVALID_CID = 'Invalid cid'
export const INVALID_MATCH = 'Match should be a string (i.e. "exact", "iexact", "partial", "ipartial")'
export const INVALID_META = 'Meta should be an object with string values'
export const INVALID_NAME = 'Name should be a string'
export const INVALID_ORIGINS = 'Origins should be an array of strings'
export const INVALID_REQUEST_ID = 'Request id should be a string containing digits only'
export const INVALID_REPLACE = 'Existing and replacement CID are the same'
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
 * @return {Promise<JSONResponse>}
 */
export async function pinPost (request, env, ctx) {
  const pinData = await request.json()
  const { cid, name, origins, meta } = pinData

  // Require cid
  if (!cid) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: REQUIRED_CID } },
      { status: ERROR_CODE }
    )
  }

  // Validate cid
  try {
    normalizeCid(cid)
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

  const { authToken } = request.auth
  const requestId = request.params ? request.params.requestId : null

  if (requestId) {
    if (typeof requestId !== 'string' || !(/^\d+$/.test(requestId))) {
      return new JSONResponse(
        { error: { reason: ERROR_STATUS, details: INVALID_REQUEST_ID } },
        { status: ERROR_CODE }
      )
    }

    return replacePin(pinData, parseInt(requestId, 10), authToken._id, env, ctx)
  }

  return createPin(pinData, authToken._id, env, ctx)
}

/**
 * @param {Object} pinData
 * @param {string} authToken
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<JSONResponse>}
 */
async function createPin (pinData, authToken, env, ctx) {
  const { cid, origins, meta } = pinData
  const normalizedCid = normalizeCid(cid)

  const pinName = pinData.name || undefined // deal with empty strings

  await env.cluster.pin(cid, {
    name: pinName,
    origins,
    metadata: meta
  })
  const pins = await getPins(cid, env.cluster)

  const pinRequestData = {
    requestedCid: cid,
    contentCid: normalizedCid,
    authKey: authToken,
    name: pinName,
    pins
  }

  const pinRequest = await env.db.createPAPinRequest(pinRequestData)

  // TODO: create resuable function to create pinResponseData
  /** @type {ServiceApiPinStatus} */
  const serviceApiPinStatus = {
    requestId: pinRequest._id.toString(),
    created: pinRequest.created,
    status: getPinningAPIStatus(pinRequest.pins),
    // TODO(https://github.com/web3-storage/web3.storage/issues/792)
    delegates: [],
    pin: { cid }
  }

  /** @type {(() => Promise<any>)[]} */
  const tasks = []

  if (!pins.some(p => PIN_OK_STATUS.includes(p.status))) {
    tasks.push(
      waitAndUpdateOkPins.bind(
        null,
        normalizeCid,
        env.cluster,
        env.db)
    )
  }

  // TODO(https://github.com/web3-storage/web3.storage/issues/794)
  // Backups. At the moment backups are related to uploads so
  // they' re currently not taken care of in respect of a pin request.

  if (ctx.waitUntil) {
    tasks.forEach(t => ctx.waitUntil(t()))
  }

  return new JSONResponse(serviceApiPinStatus)
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinGet (request, env, ctx) {
  // Check if requestId contains other charachers than digits
  if (!(/^\d+$/.test(request.params.requestId))) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  const requestId = parseInt(request.params.requestId, 10)

  /** @type { import('../../db/db-client-types.js').PAPinRequestUpsertOutput } */
  let pinRequest

  try {
    pinRequest = await env.db.getPAPinRequest(requestId)
  } catch (e) {
    console.error(e)
    // TODO catch different exceptions
    // TODO notFound error paylod does not strictly comply to spec.
    return notFound()
  }

  /** @type { ServiceApiPinStatus } */
  const response = {
    requestId: pinRequest._id,
    created: pinRequest.created,
    // TODO(https://github.com/web3-storage/web3.storage/issues/792) populate delegates
    delegates: [],
    status: getPinningAPIStatus(pinRequest.pins),
    pin: {
      cid: pinRequest.requestedCid,
      name: pinRequest.name,
      // TODO(https://github.com/web3-storage/web3.storage/issues/792) populate origins and meta
      origins: [],
      meta: {}
    }
  }

  return new JSONResponse(response)
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
      const normalizedCid = normalizeCid(cid) // eslint-disable-line
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
  let requestId = request.params.requestId
  // Don't delete pin requests that don't belong to the user
  const { authToken } = request.auth

  if (!requestId) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: REQUIRED_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  if (typeof requestId !== 'string' || !(/^\d+$/.test(requestId))) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  requestId = parseInt(requestId, 10)

  let res
  try {
    // Update deleted_at (and updated_at) timestamp for the pin request.
    res = await env.db.deletePAPinRequest(requestId, authToken._id)
  } catch (e) {
    console.error(e)
    // TODO catch different exceptions
    // TODO notFound error paylod does not strictly comply to spec.
    return notFound()
  }

  return new JSONResponse(res)
}

/**
 * @param {Object} newPinData
 * @param {number} requestId
 * @param {string} authToken
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
async function replacePin (newPinData, requestId, authToken, env, ctx) {
  let existingPinRequest
  try {
    existingPinRequest = await env.db.getPAPinRequest(requestId)
  } catch (e) {
    return notFound()
  }

  const existingCid = existingPinRequest.requestedCid
  if (newPinData.cid === existingCid) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_REPLACE } },
      { status: ERROR_CODE }
    )
  }

  let pinStatus
  try {
    pinStatus = await createPin(newPinData, authToken, env, ctx)
  } catch (e) {
    return new JSONResponse(
      { error: { reason: `DB Error: ${e}` } },
      { status: 501 }
    )
  }

  try {
    await env.db.deletePAPinRequest(requestId, authToken)
  } catch (e) {
    return new JSONResponse(
      { error: { reason: `DB Error: ${e}` } },
      { status: 501 }
    )
  }

  return pinStatus
}
