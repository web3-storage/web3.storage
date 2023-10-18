import { Validator } from '@cfworker/json-schema'
import { PSACodecNotSupported, PSAErrorInvalidData, PSAErrorRequiredData } from '../errors.js'
import { normalizeCid } from '../utils/cid.js'
import * as raw from 'multiformats/codecs/raw'
import * as pb from '@ipld/dag-pb'
import * as dagJson from '@ipld/dag-json'
import * as dagCbor from '@ipld/dag-cbor'
import { CID } from 'multiformats/cid'

/**
 * List of the PSA supported codecs codes.
 *
 * @type {number[]}
 */
const SUPPORTED_CODECS = [
  raw.code,
  pb.code,
  dagCbor.code,
  dagJson.code
]

/**
 * @typedef {'queued' | 'pinning' | 'failed' | 'pinned'} apiPinStatus
 * @typedef {{ error?: PSAErrorInvalidData, data?: {} }} parsedData
 */

/**
 * @param {import('@web3-storage/db/db-client-types').PinItemOutput[]} pins
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
  // A cluster status of "Unpinned" or "PinQueued" is equivalent to a "queued" PSA status.
  if (pinStatuses.includes('PinQueued') ||
      pinStatuses.includes('Unpinned')) {
    return 'queued'
  }

  // TODO after some time if there are no pins we should give up and return a failed
  // status instead

  return 'failed'
}

const psaStatusesToDBStatusesMap = {
  pinned: ['Pinned'],
  queued: ['PinQueued', 'Unpinned'],
  pinning: ['Pinning'],
  failed: [
    'UnexpectedlyUnpinned',
    'ClusterError',
    'PinError'
  ]
}

/**
 * Maps a pinning api status array to db status accepted by the DB.
 * @param {string[]} statuses
 * @return {import('@web3-storage/db/postgres/pg-rest-api-types').definitions['pin']['status'][]}
 */
export const psaStatusesToDBStatuses = (statuses) => {
  return statuses.reduce((mappedStatuses, psaStatus) => {
    return mappedStatuses.concat(psaStatusesToDBStatusesMap[psaStatus])
  }, [])
}

// Error messages
export const ERROR_CODE = 400
export const DATA_NOT_FOUND = 'Requested data was not found.'
export const INVALID_CID = 'The CID provided is invalid.'
export const INVALID_META = 'Meta should be an object with string values'
export const INVALID_REQUEST_ID = 'Request id should be a string.'
export const PINNING_FAILED = 'PSA_PINNING_FAILED'
export const REQUIRED_REQUEST_ID = 'Request id is required.'

export const DEFAULT_PIN_LISTING_LIMIT = 10
export const MAX_PIN_LISTING_LIMIT = 1000

// Validation schemas
const listPinsValidator = new Validator({
  type: 'object',
  required: [],
  properties: {
    name: { type: 'string', maxLength: 255 },
    after: { type: 'string', format: 'date-time' },
    before: { type: 'string', format: 'date-time' },
    cid: { type: 'array', items: { type: 'string' } },
    limit: { type: 'integer', minimum: 1, maximum: MAX_PIN_LISTING_LIMIT },
    meta: {
      type: 'object',
      additionalProperties: { type: 'string' }
    },
    match: {
      type: 'string',
      enum: ['exact', 'iexact', 'ipartial', 'partial']
    },
    status: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['queued', 'pinning', 'pinned', 'failed']
      }
    }
  }
})

const postPinValidator = new Validator({
  type: 'object',
  required: ['cid'],
  properties: {
    cid: { type: 'string' },
    name: { type: 'string', maxLength: 255 },
    meta: { type: 'object', keys: { type: 'string' } },
    origins: { type: 'array', items: { type: 'string' }, maxItems: 20 },
    requestId: { type: 'string' }
  }
})

/**
 * Helper function to parse and validate payload for POST endpoint.
 *
 * @param {*} payload
 * @returns parsedData
 */
export function transformAndValidate (payload) {
  /** @type {*} */
  const opts = {}
  /**
   * Libp2pKey Codec, used for IPNS records. Codec table for reference [here](https://github.com/multiformats/multicodec/blob/master/table.csv)
   */
  const libp2pKeyCodec = 72
  const {
    cid,
    name,
    meta,
    origins,
    requestId
  } = payload
  let normalizedCid

  // Validate CID.
  if (cid) {
    try {
      let c
      try {
        c = CID.parse(cid)
        normalizedCid = c.toV1().toString()
        opts.cid = cid
      } catch (e) {
        throw new PSAErrorInvalidData(INVALID_CID)
      }

      if (!SUPPORTED_CODECS.includes(c.code)) {
        let message = PSACodecNotSupported.MESSAGE
        if (c.code === libp2pKeyCodec) {
          message = `${message} If you're trying to pin using an IPNS record that isn't supported yet. Please +1 [this github issue](https://github.com/web3-storage/web3.storage/issues/2155) if you want it to be.`
        }
        throw new PSACodecNotSupported(message)
      }
    } catch (e) {
      return {
        error: e,
        data: undefined,
        normalizeCid: undefined
      }
    }
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
    error = parseValidatorErrors(result.errors)
  }

  return { data, normalizedCid, error }
}

/**
 * Helper function to parse and validate queryString for GET endpoint.
 *
 * @param {*} queryString
 * @returns parsedData
 */
export function validateSearchParams (queryString) {
  /** @type {*} */
  const opts = {}
  const {
    after,
    before,
    cid,
    limit,
    match,
    meta,
    name,
    status
  } = queryString

  // Validate CID(s).
  if (cid) {
    const cids = cid.split(',')
    const sourceCids = []
    for (const cid of cids) {
      try {
        normalizeCid(cid)
        sourceCids.push(cid)
      } catch (e) {
        return {
          error: new PSAErrorInvalidData(INVALID_CID),
          data: undefined
        }
      }
    }
    opts.cid = sourceCids
  }

  if (limit) {
    opts.limit = Number(limit)
  } else {
    opts.limit = DEFAULT_PIN_LISTING_LIMIT
  }

  if (meta) {
    // Must be a string representation of a JSON object.
    let metaJson
    try {
      metaJson = JSON.parse(meta)
    } catch (e) {
      return {
        error: new PSAErrorInvalidData(INVALID_META),
        data: undefined
      }
    }

    opts.meta = metaJson
  }

  if (name) opts.name = name
  if (match) opts.match = match
  if (before) opts.before = before
  if (after) opts.after = after
  if (status) opts.status = status.split(',')

  const result = listPinsValidator.validate(opts)

  let data
  let error

  if (result.valid) {
    // Map statuses for DB compatibility.
    opts.statuses = opts.status && psaStatusesToDBStatuses(opts.status)
    data = opts
  } else {
    error = parseValidatorErrors(result.errors)
  }

  return { data, error }
}

/**
 * Helper function to parse error messages coming from the validator.
 *
 * @param {import('@cfworker/json-schema').OutputUnit[]} errors
 * @returns {PSAErrorInvalidData}
 */
export function parseValidatorErrors (errors) {
  // Pass through the error message of the last validation errors array.
  // Last error message contains the most useful information.
  const errorDetail = errors.pop()
  if (!errorDetail) return new PSAErrorInvalidData()

  const location = errorDetail.instanceLocation
  const message = errorDetail.error
  const errorType = errorDetail.keyword

  switch (errorType) {
    case 'required':
      return new PSAErrorRequiredData(message)
    default:
      return new PSAErrorInvalidData(`${location}: ${message}`)
  }
}
