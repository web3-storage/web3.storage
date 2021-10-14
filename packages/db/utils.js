/**
 * Normalize upload item.
 *
 * @param {import('./db-client-types').UploadItem} upload
 * @return {import('./db-client-types').UploadItemOutput}
 */
export function normalizeUpload (upload) {
  return {
    ...upload,
    ...upload.content,
    pins: normalizePins(upload.content.pins)
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
  return pins.map(pin => ({
    _id: pin._id,
    status: pin.status,
    created: pin.created,
    updated: pin.updated,
    peerId: pin.location.peerId,
    peerName: pin.location.peerName,
    region: pin.location.region
  }))
}
