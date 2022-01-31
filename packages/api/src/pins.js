import { Validator } from '@cfworker/json-schema'
import { JSONResponse, notFound } from './utils/json-response.js'
import { normalizeCid } from './utils/normalize-cid.js'
import { getPins, PIN_OK_STATUS, waitAndUpdateOkPins } from './utils/pin.js'
import { PinningServiceApiError } from './errors.js'
import {
  getEffectivePinStatus,
  psaStatusesToDBStatuses,
  ERROR_CODE,
  ERROR_STATUS,
  INVALID_CID,
  INVALID_REQUEST_ID,
  INVALID_REPLACE,
  REQUIRED_REQUEST_ID
} from './utils/psa.js'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 1000

// Validation Schemas
const listPinsValidator = new Validator({
  type: 'object',
  required: [],
  properties: {
    name: { type: 'string' },
    after: { type: 'string', format: 'date-time' },
    before: { type: 'string', format: 'date-time' },
    cid: { type: 'array', items: { type: 'string' } },
    limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT },
    meta: { type: 'object' },
    match: {
      type: 'string',
      enum: ['exact', 'iexact', 'ipartial', 'partial']
    },
    status: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['PinError', 'PinQueued', 'Pinned', 'Pinning']
      }
    }
  }
})

const postPinValidator = new Validator({
  type: 'object',
  required: ['cid'],
  properties: {
    cid: { type: 'string' },
    name: { type: 'string' },
    meta: { type: 'object', keys: { type: 'string' } },
    origins: { type: 'array', items: { type: 'string' } },
    requestId: { type: 'string' }
  }
})

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
 * @typedef {{ error: { reason: string, details?: string } }} PinDataError
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

  const result = parsePinObject(pinData)

  if (result.error) {
    return new JSONResponse(result.error, { status: 400 })
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
    return new JSONResponse(
      new PinningServiceApiError(INVALID_REQUEST_ID, ERROR_STATUS),
      { status: ERROR_CODE }
    )
  }

  const { authToken } = request.auth

  /** @type { import('../../db/db-client-types.js').PsaPinRequestUpsertOutput } */
  let pinRequest

  try {
    pinRequest = await env.db.getPsaPinRequest(authToken._id, request.params.requestId)
  } catch (e) {
    console.error(e)
    return new JSONResponse(
      new PinningServiceApiError(e, 'DB_ERROR'),
      { status: 501 }
    )
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
function parsePinObject (params) {
  const opts = {}
  const {
    cid,
    name,
    meta,
    origins,
    requestId
  } = params

  try {
    opts.cid = normalizeCid(cid)
  } catch (err) {
    return new JSONResponse(
      { error: { reason: ERROR_STATUS, details: INVALID_CID } },
      { status: ERROR_CODE }
    )
  }

  if (name) opts.name = name
  if (meta) opts.meta = meta
  if (origins) opts.origins = origins
  if (requestId) opts.requestId = requestId

  const result = postPinValidator.validate(opts)

  let data
  let error

  if (result.valid) {
    data = opts
  } else {
    error = new PinningServiceApiError(JSON.stringify(result.errors))
  }

  return { data, error }
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
    opts.name = name
  }

  if (match) {
    opts.match = match
  }

  if (status) {
    opts.status = status.split(',').map(psaStatusesToDBStatuses)
  }

  if (before) {
    opts.before = before
  }

  if (after) {
    opts.after = after
  }

  opts.limit = limit ? Number(limit) : DEFAULT_LIMIT

  const result = listPinsValidator.validate(opts)

  let data
  let error

  if (result.valid) {
    data = opts
  } else {
    error = new PinningServiceApiError(JSON.stringify(result.errors))
  }

  return { data, error }
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
    return new JSONResponse(
      new PinningServiceApiError(REQUIRED_REQUEST_ID),
      { status: ERROR_CODE }
    )
  }

  if (typeof requestId !== 'string') {
    return new JSONResponse(
      new PinningServiceApiError(INVALID_REQUEST_ID),
      { status: ERROR_CODE }
    )
  }

  try {
    // Update deleted_at (and updated_at) timestamp for the pin request.
    await env.db.deletePsaPinRequest(requestId, authToken._id)
  } catch (e) {
    console.error(e)
    return new JSONResponse(
      new PinningServiceApiError(e, 'DB_ERROR'),
      { status: 501 }
    )
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
    return notFound()
  }

  const existingCid = existingPinRequest.sourceCid
  if (newPinData.cid === existingCid) {
    return new JSONResponse(
      new PinningServiceApiError(INVALID_REPLACE, ERROR_STATUS),
      { status: ERROR_CODE }
    )
  }

  let pinStatus
  try {
    pinStatus = await createPin(existingPinRequest.contentCid, newPinData, authTokenId, env, ctx)
  } catch (e) {
    return new JSONResponse(
      new PinningServiceApiError(e, 'DB_ERROR'),
      { status: 501 }
    )
  }

  try {
    await env.db.deletePsaPinRequest(requestId, authTokenId)
  } catch (e) {
    return new JSONResponse(
      new PinningServiceApiError(e, 'DB_ERROR'),
      { status: 501 }
    )
  }

  return pinStatus
}
