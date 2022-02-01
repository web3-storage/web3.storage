import { JSONResponse } from './utils/json-response.js'
import { normalizeCid } from './utils/cid.js'
import { getPins, PIN_OK_STATUS, waitAndUpdateOkPins } from './utils/pin.js'
import { PinningServiceApiError } from './errors.js'
import {
  getEffectivePinStatus,
  ERROR_STATUS,
  INVALID_REQUEST_ID,
  INVALID_REPLACE,
  REQUIRED_REQUEST_ID,
  listPinsValidator,
  validatePayload,
  postPinValidator,
  DEFAULT_PIN_LISTING_LIMIT,
  ERROR_REASON
} from './utils/psa.js'

/**
 * @typedef {import('./utils/psa').apiPinStatus} apiPinStatus
 */

/**
 *
 * Service API Pin object definition
 * @typedef {Object} PsaPin
 * @property {string} cid
 * @property {string} [name]
 * @property {Array.<string>} [origins]
 * @property {object} [meta]
 */

/**
 *
 * Service API Pin Status definition
 * @typedef {Object} PsaPinStatusResponse
 * @property {string} requestId
 * @property {apiPinStatus} status
 * @property {string} created
 * @property {Array<string>} delegates
 * @property {string} [info]
 *
 * @property {PsaPin} pin
 */

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<JSONResponse>}
 */
export async function pinPost (request, env, ctx) {
  const pinData = await request.json()
  const { authToken } = request.auth
  pinData.requestId = request.params ? request.params.requestId : null

  const result = validatePayload(pinData, postPinValidator)

  if (result.error) {
    throw result.error
  }

  const pinObject = result.data

  if (pinObject.requestId) {
    return replacePin(pinObject, pinObject.requestId, authToken._id, env, ctx)
  }

  return createPin(pinObject.cid, pinObject, authToken._id, env, ctx)
}

/**
 * @param {string} normalizedCid
 * @param {Object} pinData
 * @param {string} authTokenId
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<JSONResponse>}
 */
async function createPin (normalizedCid, pinData, authTokenId, env, ctx) {
  const { cid, origins } = pinData

  // deal with empty strings
  const pinName = pinData.name || undefined
  const pinMeta = pinData.meta || undefined

  await env.cluster.pin(cid, {
    name: pinName,
    origins
  })
  const pins = await getPins(cid, env.cluster)

  const pinRequestData = {
    sourceCid: cid,
    contentCid: normalizedCid,
    authKey: authTokenId,
    meta: pinMeta,
    name: pinName,
    origins,
    pins
  }

  const pinRequest = await env.db.createPsaPinRequest(pinRequestData)

  /** @type {PsaPinStatusResponse} */
  const pinStatus = getPinStatus(pinRequest)

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

  if (ctx.waitUntil) {
    tasks.forEach(t => ctx.waitUntil(t()))
  }

  return new JSONResponse(pinStatus)
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinGet (request, env, ctx) {
  if (typeof request.params.requestId !== 'string') {
    throw new PinningServiceApiError(ERROR_REASON, INVALID_REQUEST_ID, ERROR_STATUS)
  }

  const { authToken } = request.auth

  /** @type { import('../../db/db-client-types.js').PsaPinRequestUpsertOutput } */
  let pinRequest

  try {
    pinRequest = await env.db.getPsaPinRequest(authToken._id, request.params.requestId)
  } catch (e) {
    throw new PinningServiceApiError('DB_ERROR', e, 404)
  }

  /** @type { PsaPinStatusResponse } */
  return new JSONResponse(getPinStatus(pinRequest))
}

/**
 * List all the pins matching optional filters.
 * When no filter is specified, only successful pins are returned.
 *
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinsGet (request, env, ctx) {
  const url = new URL(request.url)
  const urlParams = new URLSearchParams(url.search)
  const params = Object.fromEntries(urlParams)

  const result = validatePayload(params, listPinsValidator)
  if (result.error) {
    throw result.error
  }

  let pinRequests
  const opts = result.data

  // Set a default limit if one is not provided
  if (!opts.limit) opts.limit = DEFAULT_PIN_LISTING_LIMIT

  try {
    pinRequests = await env.db.listPsaPinRequests(request.auth.authToken._id, opts)
  } catch (e) {
    console.error(e)
    throw new PinningServiceApiError('DB_ERROR', e, 404)
  }

  const pins = pinRequests.results.map((pinRequest) => getPinStatus(pinRequest))

  return new JSONResponse({
    count: pinRequests.count,
    results: pins
  })
}

/**
 * Transform a PinRequest into a PinStatus
 *
 * @param { Object } pinRequest
 * @returns { PsaPinStatusResponse }
 */
function getPinStatus (pinRequest) {
  return {
    requestId: pinRequest._id.toString(),
    status: getEffectivePinStatus(pinRequest.pins),
    created: pinRequest.created,
    pin: {
      cid: pinRequest.sourceCid,
      ...pinRequest
    },
    // TODO(https://github.com/web3-storage/web3.storage/issues/792)
    delegates: []
  }
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinDelete (request, env, ctx) {
  const requestId = request.params.requestId
  // Don't delete pin requests that don't belong to the user
  const { authToken } = request.auth

  if (!requestId) {
    throw new PinningServiceApiError(ERROR_REASON, REQUIRED_REQUEST_ID, ERROR_STATUS)
  }

  if (typeof requestId !== 'string') {
    throw new PinningServiceApiError(ERROR_REASON, INVALID_REQUEST_ID, ERROR_STATUS)
  }

  try {
    // Update deleted_at (and updated_at) timestamp for the pin request.
    await env.db.deletePsaPinRequest(requestId, authToken._id)
  } catch (e) {
    console.error(e)
    throw new PinningServiceApiError('DB_ERROR', e, 404)
  }

  return new JSONResponse({}, { status: 202 })
}

/**
 * @param {Object} newPinData
 * @param {string} requestId
 * @param {string} authTokenId
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
async function replacePin (newPinData, requestId, authTokenId, env, ctx) {
  let existingPinRequest
  try {
    existingPinRequest = await env.db.getPsaPinRequest(authTokenId, requestId)
  } catch (e) {
    throw new PinningServiceApiError('DB_ERROR', e, 404)
  }

  const existingCid = existingPinRequest.sourceCid
  if (newPinData.cid === existingCid) {
    throw new PinningServiceApiError(ERROR_REASON, INVALID_REPLACE, ERROR_STATUS)
  }

  let pinStatus
  try {
    pinStatus = await createPin(existingPinRequest.contentCid, newPinData, authTokenId, env, ctx)
  } catch (e) {
    throw new PinningServiceApiError('DB_ERROR', e, 404)
  }

  try {
    await env.db.deletePsaPinRequest(requestId, authTokenId)
  } catch (e) {
    throw new PinningServiceApiError('DB_ERROR', e, 404)
  }

  return pinStatus
}
