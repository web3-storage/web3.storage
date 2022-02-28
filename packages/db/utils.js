/**
 * Normalize upload item.
 *
 * @param {import('./db-client-types').UploadItem} upload
 * @return {import('./db-client-types').UploadItemOutput}
 */
export function normalizeUpload (upload) {
  const nUpload = { ...upload }
  delete nUpload.content

  return {
    ...nUpload,
    ...upload.content,
    pins: normalizePins(upload.content.pins, {
      isOkStatuses: true
    })
  }
}

/**
 * Normalize pin request
 *
 * @param {object} psaPinRequest
 * @return {import('./db-client-types').PsaPinRequestUpsertOutput}
 */
export function normalizePsaPinRequest (psaPinRequest) {
  const nPsaPinRequest = { ...psaPinRequest }
  delete nPsaPinRequest.content

  return {
    ...nPsaPinRequest,
    pins: psaPinRequest.content?.pins ? normalizePins(psaPinRequest.content.pins) : []
  }
}

/**
 * Normalize content item.
 *
 * @param {import('./db-client-types').ContentItem} content
 * @return {import('./db-client-types').ContentItemOutput}
 */
export function normalizeContent (content) {
  return {
    ...content,
    pins: normalizePins(content.pins)
  }
}

/**
 * Normalize pin items.
 *
 * @param {Array<import('./db-client-types').PinItem>} pins
 * @param {object} [opt]
 * @param {boolean} [opt.isOkStatuses]
 * @return {Array<import('./db-client-types').PinItemOutput>}
 */
export function normalizePins (pins, {
  isOkStatuses = false
} = {}) {
  if (isOkStatuses) {
    pins = pins.filter(pin => PIN_OK_STATUS.has(pin.status))
  }

  return pins
    .map(pin => ({
      _id: pin._id,
      status: pin.status,
      created: pin.created,
      updated: pin.updated,
      peerId: pin.location.peerId,
      peerName: pin.location.peerName,
      region: pin.location.region
    }))
}

/**
 * Normalize deal items.
 */
export function normalizeDeals (deals) {
  return deals.filter(deal => DEAL_STATUS.has(deal.status))
    .map(deal => ({
      dealId: deal.dealId,
      storageProvider: deal.storageProvider,
      status: deal.status[0].toUpperCase() + deal.status.slice(1),
      // FIXME: should be returned from SQL as contentCid (aggregate.cid_v1)
      contentCid: deal.dataCid,
      pieceCid: deal.pieceCid,
      // FIXME: should be returned from SQL as dataCid (aggregate.aggregate_cid)
      dataCid: deal.batchRootCid,
      dataModelSelector: deal.dataModelSelector,
      activation: deal.dealActivation,
      expiration: deal.dealExpiration,
      created: deal.created,
      updated: deal.updated
    }))
}

const PIN_OK_STATUS = new Set([
  'Pinned',
  'Pinning',
  'PinQueued'
])

const DEAL_STATUS = new Set([
  'queued',
  'published',
  'active'
])

/**
 * Convert a number string to a number.
 *
 * Note:
 * Conversion needed since Postgres BIGINT type is returned from DB as a string.
 *
 * @param {string} numberText
 * @returns number
 */
export function parseTextToNumber (numberText) {
  const num = Number(numberText)
  if (!Number.isSafeInteger(num)) {
    throw new Error('Invalid number.')
  }
  return num
}
