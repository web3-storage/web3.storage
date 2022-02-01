import { Validator } from '@cfworker/json-schema'
import { PinningServiceApiError, PSAErrorInvalidCid } from '../errors.js'
import { normalizeCid } from './normalize-cid.js'

/**
 * @typedef {'queued' | 'pinning' | 'failed' | 'pinned'} apiPinStatus
 */

/**
 * @param {import('../../../db/db-client-types.js').PinItemOutput[]} pins
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

  // The cluster may return "Unpinned" as the initial status.
  // The cluster will return "Remote" if it has been queued for pinning by another node.
  // A cluster status of "Unpinned", "Remote" or "PinQueued" is equivalent to a "queued" PSA status.
  if (pinStatuses.includes('PinQueued') ||
      pinStatuses.includes('Remote') ||
      pinStatuses.includes('Unpinned')) {
    return 'queued'
  }

  // TODO after some time if there are no pins we should give up and return a failed
  // status instead

  return 'failed'
}

const psaStatusesToDBStatusesMap = {
  pinned: ['Pinned'],
  queued: ['PinQueued'],
  pinning: ['Pinning'],
  failed: [
    'ClusterError',
    'PinError'
  ]
}

/**
 * Maps a pinning api status array to db status accepted by the DB
 * @param {string[]} statuses
 * @return {import('@web3-storage/db/postgres/pg-rest-api-types').definitions['pin']['status'][]}
 */
export const psaStatusesToDBStatuses = (statuses) => {
  return statuses.reduce((mappedStatuses, psaStatus) => {
    return mappedStatuses.concat(psaStatusesToDBStatusesMap[psaStatus])
  }, [])
}

// Error messages
// TODO: Refactor errors
export const ERROR_STATUS = 400
export const ERROR_REASON = 'INVALID_PIN_DATA'
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
export const DEFAULT_PIN_LISTING_LIMIT = 10
export const MAX_PIN_LISTING_LIMIT = 1000

// Validation Schemas
export const listPinsValidator = new Validator({
  type: 'object',
  required: [],
  properties: {
    name: { type: 'string' },
    after: { type: 'string', format: 'date-time' },
    before: { type: 'string', format: 'date-time' },
    cid: { type: 'array', items: { type: 'string' } },
    limit: { type: 'integer', minimum: 1, maximum: MAX_PIN_LISTING_LIMIT },
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

export const postPinValidator = new Validator({
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
 * Helper function to parse and validate payload
 *
 * @param {*} payload
 * @param {*} validator
 * @returns
 */
export function validatePayload (payload, validator) {
  /** @type {*} */
  const opts = {}
  Object.keys(payload).forEach((param) => {
    if (payload[param]) opts[param] = payload[param]
  })

  // Validate CID or list of CIDs if present
  if (opts.cid) {
    if (Array.isArray(opts.cid)) {
      const cids = []
      try {
        opts.cid.split(',').forEach(cid => {
          cids.push(normalizeCid(cid))
        })
      } catch (err) {
        return {
          error: new PSAErrorInvalidCid(),
          data: undefined
        }
      }
      opts.cids = cids
    } else {
      try {
        opts.cid = normalizeCid(opts.cid)
      } catch (err) {
        return {
          error: new PSAErrorInvalidCid(),
          data: undefined
        }
      }
    }
  }

  // Process pin statuses
  if (opts.status) {
    opts.status = opts.status.split(',').map(psaStatusesToDBStatuses)
  }

  // Limit should be a number
  if (opts.limit) {
    opts.limit = Number(opts.limit)
  }

  const result = validator.validate(opts)

  let data
  let error

  if (result.valid) {
    data = opts
  } else {
    error = new PinningServiceApiError()
  }

  return { data, error }
}
