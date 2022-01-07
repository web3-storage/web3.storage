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
    pins: normalizePins(upload.content.pins)
  }
}

// TODO: this looks really similar to normalizeUpload.
// should be merged together
/**
 * Normalize pin request
 *
 * @param {object} paPinRequest
 * @return {import('./db-client-types').PAPinRequestUpsertOutput}
 */
export function normalizePaPinRequest (paPinRequest) {
  const nPaPinRequest = { ...paPinRequest }
  delete nPaPinRequest.content

  return {
    ...nPaPinRequest,
    pins: paPinRequest.content?.pins ? normalizePins(paPinRequest.content.pins) : []
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
 * @return {Array<import('./db-client-types').PinItemOutput>}
 */
export function normalizePins (pins) {
  return pins.filter(pin => Object.keys(PIN_STATUS).includes(pin.status))
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

const DEAL_STATUS = new Set([
  'queued',
  'published',
  'active'
])

export const PIN_STATUS = Object.freeze({
  PinQueued: 'PinQueued',
  Pinning: 'Pinning',
  Pinned: 'Pinned',
  PinError: 'PinError'
})

export const PIN_STATUS_FILTER = Object.freeze({
  queued: 'queued',
  pinning: 'pinning',
  pinned: 'pinned',
  failed: 'failed'
})
