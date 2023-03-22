// @ts-nocheck
import { JSONResponse } from './utils/json-response.js'
import { getPins, PIN_OK_STATUS, waitAndUpdateOkPins, fetchAndUpdatePins } from './utils/pin.js'
import { PSAErrorDB, PSAErrorResourceNotFound, PSAErrorInvalidData, PSAErrorRequiredData, PinningServiceApiError } from './errors.js'
import {
  INVALID_REQUEST_ID,
  PINNING_FAILED,
  REQUIRED_REQUEST_ID,
  getEffectivePinStatus,
  validateSearchParams,
  transformAndValidate
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
 * @property {string} requestid
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

  const {
    data: pinObject,
    normalizedCid,
    error
  } = transformAndValidate(pinData)

  if (error) {
    throw error
  }

  if (pinObject.requestId) {
    return replacePin(normalizedCid, pinObject, pinObject.requestId, authToken._id, env, ctx)
  }

  return createPin(normalizedCid, pinObject, authToken._id, env, ctx)
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

  const pinRes = await env.cluster.pin(cid, {
    name: pinName,
    origins
  })
  const delegates = pinRes?.metadata?.delegates
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
  const pinStatus = toPinStatusResponse(pinRequest, delegates)

  /** @type {(() => Promise<any>)[]} */
  const tasks = []

  if (!pins.some(p => PIN_OK_STATUS.includes(p.status))) {
    tasks.push(
      waitAndUpdateOkPins.bind(
        null,
        normalizedCid,
        env.cluster,
        env.db)
    )
  }

  if (ctx.waitUntil) {
    tasks.forEach(t => ctx.waitUntil(t()))
  }

  return new JSONResponse(pinStatus, { status: 202 })
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinGet (request, env, ctx) {
  if (typeof request.params.requestId !== 'string') {
    throw new PSAErrorInvalidData(INVALID_REQUEST_ID)
  }

  const { authToken } = request.auth

  /** @type { import('../../db/db-client-types.js').PsaPinRequestUpsertOutput } */
  let pinRequest

  try {
    pinRequest = await env.db.getPsaPinRequest(authToken._id, request.params.requestId)
  } catch (e) {
    console.error(e)
    throw new PSAErrorResourceNotFound()
  }

  const inProgress = pinRequest.pins.filter((p) => p.status === 'PinQueued' || p.status === 'Pinning')

  if (inProgress.length > 0) {
    await fetchAndUpdatePins(pinRequest.contentCid, env.cluster, env.db)
    pinRequest = await env.db.getPsaPinRequest(authToken._id, request.params.requestId)
  }

  /** @type { PsaPinStatusResponse } */
  return new JSONResponse(toPinStatusResponse(pinRequest))
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

  const result = validateSearchParams(params)
  if (result.error) {
    throw result.error
  }

  let pinRequests
  const opts = result.data

  try {
    pinRequests = await env.db.listPsaPinRequests(request.auth.authToken._id, opts)
  } catch (e) {
    console.error(e)
    throw new PSAErrorResourceNotFound()
  }

  const pins = pinRequests.results.map((pinRequest) => toPinStatusResponse(pinRequest))

  return new JSONResponse({
    count: pinRequests.count,
    results: pins
  })
}

/**
 * Transform a PinRequest into a PinStatus
 *
 * @param { import('../../db/db-client-types.js').PsaPinRequestUpsertOutput } pinRequest
 * @param {string[]} delegates
 * @returns { PsaPinStatusResponse }
 */
export function toPinStatusResponse (pinRequest, delegates = []) {
  return {
    requestid: pinRequest._id.toString(),
    status: getEffectivePinStatus(pinRequest.pins),
    created: pinRequest.created,
    pin: {
      cid: pinRequest.sourceCid,
      ...pinRequest.name && { name: pinRequest.name },
      ...pinRequest.origins && { origins: pinRequest.origins },
      ...pinRequest.meta && { meta: pinRequest.meta }
    },
    delegates
  }
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<JSONResponse>}
 */
export async function pinDelete (request, env, ctx) {
  const requestId = request.params.requestId
  // Don't delete pin requests that don't belong to the user
  const { authToken } = request.auth

  if (!requestId) {
    throw new PSAErrorRequiredData(REQUIRED_REQUEST_ID)
  }

  if (typeof requestId !== 'string') {
    throw new PSAErrorInvalidData(INVALID_REQUEST_ID)
  }

  try {
    // Update deleted_at (and updated_at) timestamp for the pin request.
    await env.db.deletePsaPinRequest(requestId, [authToken._id])
  } catch (e) {
    console.error(e)
    throw new PSAErrorResourceNotFound()
  }

  return new JSONResponse({}, { status: 202 })
}

/**
 * @param {Object} newPinData
 * @param {string} normalizedCid
 * @param {string} requestId
 * @param {string} authTokenId
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
async function replacePin (normalizedCid, newPinData, requestId, authTokenId, env, ctx) {
  try {
    await env.db.getPsaPinRequest(authTokenId, requestId)
  } catch (e) {
    throw new PSAErrorResourceNotFound()
  }

  let pinStatus
  try {
    pinStatus = await createPin(normalizedCid, newPinData, authTokenId, env, ctx)
  } catch (e) {
    console.error(e)
    throw new PinningServiceApiError(PINNING_FAILED, e)
  }

  try {
    await env.db.deletePsaPinRequest(requestId, [authTokenId])
  } catch (e) {
    console.error(e)
    throw new PSAErrorDB()
  }

  return pinStatus
}
