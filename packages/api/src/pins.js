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
    pinRequests = await env.db.listPAPinRequests(request.auth.authToken._id, opts)
  } catch (e) {
    console.error(e)
    return notFound()
  }

  const pins = pinRequests.map((pinRequest) => getPinStatus(pinRequest))
  return new JSONResponse({
    count: pins.length,
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
    if ((typeof before !== 'string' || (new Date(before)).getTime() <= 0)) {
      return {
        error: { reason: ERROR_STATUS, details: INVALID_TIMESTAMP },
        data: undefined
      }
    }
    opts.before = before
  }

  if (after) {
    if ((typeof after !== 'string' || (new Date(after)).getTime() <= 0)) {
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
 * @returns { ServiceApiPinStatus }
 */
function getPinStatus (pinRequest) {
  return {
    requestId: pinRequest._id,
    status: getPinningAPIStatus(pinRequest.pins),
    created: pinRequest.created,
    pin: {
      cid: pinRequest.requestedCid,
      name: pinRequest.name,
      origins: [],
      meta: {}
    },
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
