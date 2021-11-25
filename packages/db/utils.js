/**
 * Normalize upload item.
 *
 * @param {import('../db-client-types').UploadItem} upload
 * @return {import('../db-client-types').UploadItemOutput}
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

/**
 * Normalize content item.
 *
 * @param {import('../db-client-types').ContentItem} content
 * @return {import('../db-client-types').ContentItemOutput}
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
 * @param {Array<import('../db-client-types').PinItem>} pins
 * @return {Array<import('../db-client-types').PinItemOutput>}
 */
export function normalizePins (pins) {
  return pins.filter(pin => PIN_STATUS.has(pin.status))
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
      pieceCid: deal.pieceCid,
      dataCid: deal.dataCid,
      dataModelSelector: deal.dataModelSelector,
      activation: deal.dealActivation,
      expiration: deal.dealExpiration,
      created: deal.created,
      updated: deal.updated
    }))
}

const PIN_STATUS = new Set([
  'Pinned',
  'Pinning',
  'PinQueued'
])

const DEAL_STATUS = new Set([
  'queued',
  'published',
  'active'
])
