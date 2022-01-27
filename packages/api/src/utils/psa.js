/**
 * @typedef {'queued' | 'pinning' | 'failed' | 'pinned'} apiPinStatus
 */

/**
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

const psaStatusesToDBStatusesMap = {
  pinned: ['Pinned'],
  queued: ['PinQueued'],
  pinning: ['Pinning'],
  failed: [
    'ClusterError',
    'PinError',
    'Unpinned'
  ]
}

/**
 * Maps a pinning api status array to db status accepted by the DB
 * @param {string[]} statuses
 * @return {import('@web3-storage/db/postgres/pg-rest-api-types').definitions['pin']['status'][]}
 */
const psaStatusesToDBStatuses = (statuses) => {
  return statuses.reduce((mappedStatuses, psaStatus) => {
    return mappedStatuses.concat(psaStatusesToDBStatusesMap[psaStatus])
  }, [])
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
