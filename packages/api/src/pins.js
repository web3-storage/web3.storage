import { JSONResponse, notFound } from './utils/json-response.js'
import { normalizeCid } from './utils/normalize-cid.js'
import { waitToGetOkPins } from './utils/pin.js'

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

  if (pinStatuses.length === 0) {
    return 'queued'
    // TODO after some time if there are no pins we should give up and return a failed
    // status instead
  }

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
 * @return {Promise<JSONResponse>}
 */
export async function pinPost (request, env, ctx) {
  const pinData = await request.json()
  const requestId = request.params.requestId
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
  let response
  if (requestId) {
    response = await pinReplace(request, env, ctx)
  } else {
    response = await createPin(pinData, authToken._id, env, ctx)
  }

  return new JSONResponse(response)
}

/**
 * @param {Object} pinData
 * @param {string} authToken
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @returns {Promise<ServiceApiPinStatus>}
 */
async function createPin (pinData, authToken, env, ctx) {
  const { cid, name, origins, meta } = pinData
  const normalizedCid = normalizeCid(cid)

  const pinRequestData = {
    requestedCid: cid,
    cid: normalizedCid,
    authKey: authToken
  }
  const pinOptions = {}

  if (name) {
    pinRequestData.name = name
    pinOptions.name = name
  }

  if (origins) {
    pinOptions.origins = origins
  }

  if (meta) {
    pinOptions.meta = meta
  }

  // Pin CID to Cluster
  // TODO: Look into when the returned Promised is resolved to understand if we should be awaiting this call.
  env.cluster.pin(normalizedCid, pinOptions)

  // Create Pin request in db (not creating any content at this stage if it doesn't already exists)
  const pinRequest = await env.db.createPAPinRequest(pinRequestData)

  /** @type {ServiceApiPinStatus} */
  const serviceApiPinStatus = {
    requestId: pinRequest._id.toString(),
    created: pinRequest.created,
    status: getPinningAPIStatus(pinRequest.pins),
    delegates: [],
    pin: { cid: normalizedCid }
  }

  /** @type {(() => Promise<any>)[]} */
  const tasks = []

  // If we're pinning content that is currently not in the cluster, it might take a while to
  // get the cid from the network. We check pinning status asyncrounosly.
  if (pinRequest.pins.length === 0) {
    tasks.push(async () => {
      const okPins = await waitToGetOkPins(cid, env.cluster)
      // Create the content row
      // TODO: Get dagSize
      env.db.createContent({ cid: normalizedCid, pins: okPins })
      for (const pin of okPins) {
        await env.db.upsertPin(normalizedCid, pin)
      }
    })
  }

  // TODO: Backups. At the moment backups are related to uploads so
  // they' re currently not taken care of in respect of a pin request.
  // We should look into this. There's an argument where backups should be related to content rather than upload, at the moment we're
  // backing up content multiple times if uploaded multiple times.
  // If we refactor that it will naturally work for merge requests as well.

  if (ctx.waitUntil) {
    tasks.forEach(t => ctx.waitUntil(t()))
  }

  return serviceApiPinStatus
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
    // TODO populate delegates
    delegates: [],
    status: getPinningAPIStatus(pinRequest.pins),
    pin: {
      cid: pinRequest.requestedCid,
      name: pinRequest.name,
      // TODO populate origins and meta
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

  if (typeof requestId !== 'string') {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  // TODO: refactor this validation (also used in GET)
  // Check if requestId contains other charachers than digits
  if (!(/^\d+$/.test(requestId))) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  requestId = parseInt(requestId, 10)

  let res
  try {
    // Update deleted_at (and updated_at) for the pin request
    res = await env.db.deletePAPinRequest(requestId, authToken._id)
  } catch (e) {
    console.error(e)
    // TODO catch different exceptions
    // TODO notFound error paylod does not strictly comply to spec.
    return notFound()
  }

  /**
   * TODO: check if there's any more pin requests left for a cid
   *  and if not, update deleted_at for the specific upload
   */

  return new JSONResponse(res)
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
async function pinReplace (request, env, ctx) {
  /**
   * TODO(alexandra):
   * 1. Get requestId
   * 2. Check if there's a PA Pin request with requestId, get cid associated with it
   *    -- Ensure it's not deleted (deleted_at == null)
   *    -- Ensure the user is allowed to replace this pin request
   *    -- If not: throw
   * 3. Get pin data
   * 4. Normalize cid/validation
   * 5. If new cid == old cid, throw
   * 6. Create new pin (handle error)
   * 7. Delete old pin (handle error)
   * */
  const requestId = request.params.requestId
  const { authToken } = request.auth

  const existingPinRequest = await env.db.getPAPinRequest(requestId)
  if (!existingPinRequest) {
    return notFound()
  }

  // TODO: improve errors
  if (existingPinRequest.deleted) {
    return new JSONResponse(
      { error: { reason: 'Nothing to replace' } },
      { status: 501 }
    )
  }

  const existingCid = existingPinRequest.requestedCid
  const newPinData = await request.json()

  // Validate cid
  const cid = normalizeCid(newPinData.cid)

  // TODO: improve errors
  if (!cid || cid === existingCid) {
    return new JSONResponse(
      { error: { reason: 'Invalid cid/Nothing to replace' } },
      { status: 501 }
    )
  }

  let pinStatus
  try {
    pinStatus = await createPin(newPinData, authToken._id, env, ctx)
  } catch (e) {
    return new JSONResponse(
      { error: { reason: `DB Error: ${e}` } },
      { status: 501 }
    )
  }

  try {
    await pinDelete(request, env, ctx)
  } catch (e) {
    return new JSONResponse(
      { error: { reason: `DB Error: ${e}` } },
      { status: 501 }
    )
  }

  return new JSONResponse(pinStatus)
}
