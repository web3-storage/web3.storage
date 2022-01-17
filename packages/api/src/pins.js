import { JSONResponse, notFound } from './utils/json-response.js'
import { normalizeCid } from './utils/normalize-cid.js'
import { getPins, PIN_OK_STATUS, waitAndUpdateOkPins } from './utils/pin.js'

/**
 * @typedef {'queued' | 'pinning' | 'failed' | 'pinned'} apiPinStatus
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
 * @typedef {{ error: { reason: string, details?: string } }} PinDataError
 */

/**
 *
 * @param {import('../../db/db-client-types.js').PinItemOutput[]} pins
 * @return {apiPinStatus} status
 */
export const getEffectivePinStatus = (pins) => {
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
export const INVALID_STATUS = 'Status should be a list of "queued", "pinning", "pinned", or "failed"'
export const INVALID_TIMESTAMP = 'Should be a valid timestamp'
export const INVALID_LIMIT = 'Limit should be a number'
export const REQUIRED_CID = 'CID is required'
export const REQUIRED_REQUEST_ID = 'Request id is required'
export const UNPERMITTED_MATCH = 'Match should be "exact", "iexact", "partial", or "ipartial"'

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
  let normalizedCid

  // Require cid
  if (!cid) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: REQUIRED_CID } },
      { status: ERROR_CODE }
    )
  }

  // Validate cid
  try {
    normalizedCid = normalizeCid(cid)
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

  return createPin(normalizedCid, pinData, authToken._id, env, ctx)
}

/**
 * @param {string} normalizedCid
 * @param {Object} pinData
 * @param {string} authToken
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<JSONResponse>}
 */
async function createPin (normalizedCid, pinData, authToken, env, ctx) {
  const { cid, origins } = pinData

  const pinName = pinData.name || undefined // deal with empty strings

  await env.cluster.pin(cid, {
    name: pinName,
    origins
  })
  const pins = await getPins(cid, env.cluster)

  const pinRequestData = {
    sourceCid: cid,
    contentCid: normalizedCid,
    authKey: authToken,
    name: pinName,
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
  // Ensure requestId only contains digits
  if (!(/^\d+$/.test(request.params.requestId))) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_REQUEST_ID } },
      { status: ERROR_CODE }
    )
  }

  const { authToken } = request.auth
  const requestId = parseInt(request.params.requestId, 10)

  /** @type { import('../../db/db-client-types.js').PsaPinRequestUpsertOutput } */
  let pinRequest

  try {
    pinRequest = await env.db.getPsaPinRequest(authToken._id, requestId)
  } catch (e) {
    console.error(e)
    // TODO catch different exceptions
    // TODO notFound error paylod does not strictly comply to spec.
    return notFound()
  }

  /** @type { PsaPinStatusResponse } */
  const pin = getPinStatus(pinRequest)
  return new JSONResponse(pin)
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

  const result = parseSearchParams(params)
  if (result.error) {
    return new JSONResponse(result.error, { status: 400 })
  }

  let pinRequests
  const opts = result.data

  try {
    pinRequests = await env.db.listPsaPinRequests(request.auth.authToken._id, opts)
  } catch (e) {
    console.error(e)
    return notFound()
  }

  const pins = pinRequests.results.map((pinRequest) => getPinStatus(pinRequest))

  return new JSONResponse({
    count: pinRequests.count,
    results: pins
  })
}

/**
 * Parse the list options
 *
 * @param {*} params
 * @returns
 */
function parseSearchParams (params) {
  const opts = {}
  const {
    cid,
    name,
    match,
    status,
    before,
    after,
    limit
  } = params

  if (cid) {
    const cids = []
    try {
      cid.split(',').forEach((c) => {
        normalizeCid(c)
        cids.push(c)
      })
    } catch (err) {
      return {
        error: { reason: ERROR_STATUS, details: INVALID_CID },
        data: undefined
      }
    }
    opts.cid = cids
  }

  if (name) {
    if (typeof name !== 'string') {
      return {
        error: { reason: ERROR_STATUS, details: INVALID_NAME },
        data: undefined
      }
    }
    opts.name = name
  }

  if (match) {
    if (typeof match !== 'string') {
      if (!MATCH_OPTIONS.includes(match)) {
        return {
          error: { reason: ERROR_STATUS, details: UNPERMITTED_MATCH },
          data: undefined
        }
      }

      return {
        error: { reason: ERROR_STATUS, details: INVALID_MATCH },
        data: undefined
      }
    }
    opts.match = match
  }

  if (status) {
    const statuses = status.split(',')
    const isValidStatus = status.every(v => STATUS_OPTIONS.includes(v))

    if (!isValidStatus) {
      return {
        error: { reason: ERROR_STATUS, details: INVALID_STATUS },
        data: undefined
      }
    }
    // TODO(https://github.com/web3-storage/web3.storage/issues/797): statuses need to be mapped to db statuses
    opts.status = statuses
  }

  if (before) {
    if (typeof before !== 'string' || !Date.parse(before)) {
      return {
        error: { reason: ERROR_STATUS, details: INVALID_TIMESTAMP },
        data: undefined
      }
    }
    opts.before = before
  }

  if (after) {
    if (typeof after !== 'string' || !Date.parse(after)) {
      return {
        error: { reason: ERROR_STATUS, details: INVALID_TIMESTAMP },
        data: undefined
      }
    }
    opts.after = after
  }

  if (limit) {
    if (!(/^\d+$/.test(limit))) {
      return {
        error: { reason: ERROR_STATUS, details: INVALID_LIMIT },
        data: undefined
      }
    }
    opts.limit = limit
  }

  return { error: undefined, data: opts }
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
      name: pinRequest.name,
      origins: [],
      meta: {}
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

  try {
    // Update deleted_at (and updated_at) timestamp for the pin request.
    await env.db.deletePsaPinRequest(requestId, authToken._id)
  } catch (e) {
    console.error(e)
    // TODO catch different exceptions
    // TODO notFound error paylod does not strictly comply to spec.
    return notFound()
  }

  return new JSONResponse({}, { status: 202 })
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
    existingPinRequest = await env.db.getPsaPinRequest(authToken, requestId)
  } catch (e) {
    return notFound()
  }

  const existingCid = existingPinRequest.sourceCid
  if (newPinData.cid === existingCid) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_REPLACE } },
      { status: ERROR_CODE }
    )
  }

  let pinStatus
  try {
    pinStatus = await createPin(existingPinRequest.contentCid, newPinData, authToken, env, ctx)
  } catch (e) {
    return new JSONResponse(
      { error: { reason: `DB Error: ${e}` } },
      { status: 501 }
    )
  }

  try {
    await env.db.deletePsaPinRequest(requestId, authToken)
  } catch (e) {
    return new JSONResponse(
      { error: { reason: `DB Error: ${e}` } },
      { status: 501 }
    )
  }

  return pinStatus
}
