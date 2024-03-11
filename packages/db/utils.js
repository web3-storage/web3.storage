import * as Link from 'multiformats/link'
import * as Digest from 'multiformats/hashes/digest'
import { fromString } from 'uint8arrays'

/**
 * Normalize upload item.
 *
 * @param {import('./db-client-types').UploadItem} upload
 * @return {import('./db-client-types').UploadItemOutput}
 */
export function normalizeUpload (upload) {
  const nUpload = { ...upload }

  delete nUpload.content
  delete nUpload.sourceCid

  // get hash links to CARs that contain parts of this upload
  /** @type {import('./db-client-types').UploadItemOutput['parts']} */
  const parts = [
    // from upload table 'backup_urls' column
    ...carCidV1Base32sFromBackupUrls(nUpload.backupUrls ?? []),
    // there is also a backup table that maybe have been joined in
    // each backup has a url column
    ...carCidV1Base32sFromBackupUrls((nUpload.backup ?? []).map(o => o.url))
  ]
  delete nUpload.backupUrls
  delete nUpload.backup

  return {
    ...nUpload,
    ...upload.content,
    cid: upload.sourceCid, // Overwrite cid to source cid
    pins: normalizePins(upload.content.pins, {
      isOkStatuses: true
    }),
    parts
  }
}

/**
 * given array of backup_urls from uploads table, return a corresponding set of CAR CIDv1 using base32 multihash
 * for any CAR files in the backup_urls.
 * @param {string[]} backupUrls
 * @returns {Iterable<string>}
 */
function carCidV1Base32sFromBackupUrls (backupUrls) {
  const carCidStrings = new Set()
  for (const backupUrl of backupUrls) {
    let carCid
    try {
      carCid = bucketKeyToPartCID(backupUrl)
    } catch (error) {
      console.warn('error extracting car CID from bucket URL', error)
    }
    if (!carCid) continue
    carCidStrings.add(carCid.toString())
  }
  return carCidStrings
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
      peerId: pin.location.ipfsPeerId,
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
 * Used to parse the text representation of a Postgres BIGINT returned by the db client.
 * @param {string} numberText
 * @returns number
 */
export function parseTextToNumber (numberText) {
  const num = Number(numberText)
  if (!Number.isSafeInteger(num)) {
    throw new Error('Invalid integer number.')
  }
  return num
}

/**
 * @param {Number} num
 */
export function safeNumber (num) {
  if (!Number.isSafeInteger(num)) {
    throw new Error('Invalid integer number.')
  }
  return num
}

const CAR_CODE = 0x0202

/**
 * Attempts to extract a CAR CID from a bucket key.
 *
 * @param {string} key
 */
const bucketKeyToPartCID = key => {
  const filename = String(key.split('/').at(-1))
  const [hash] = filename.split('.')
  try {
    // recent buckets encode CAR CID in filename
    const cid = Link.parse(hash).toV1()
    if (cid.code === CAR_CODE) return cid
    throw new Error('not a CAR CID')
  } catch (err) {
    // older buckets base32 encode a CAR multihash <base32(car-multihash)>.car
    try {
      const digestBytes = fromString(hash, 'base32')
      const digest = Digest.decode(digestBytes)
      return Link.create(CAR_CODE, digest)
    } catch (error) {
      // console.warn('error trying to create CID from s3 key', error)
    }
  }
}
