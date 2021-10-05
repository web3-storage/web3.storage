/**
 * Normalize upload item.
 *
 * @param {import('./db-client-types').UploadItem} upload
 * @return {import('./db-client-types').UploadItemOutput}
 */
export function normalizeUpload (upload) {
  return {
    id: upload.id,
    type: upload.type,
    name: upload.name,
    created: upload.inserted_at,
    updated: upload.updated_at,
    cid: upload.content.cid,
    dagSize: upload.content.dag_size,
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
    created: content.inserted_at,
    cid: content.cid,
    dagSize: content.dag_size,
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
    id: pin.id,
    status: pin.status,
    created: pin.inserted_at,
    updated: pin.updated_at,
    peerId: pin.pin_location.peer_id,
    peerName: pin.pin_location.peer_name,
    region: pin.pin_location.region
  }))
}
