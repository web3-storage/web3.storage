import retry from 'p-retry'
/**
 * @typedef {import('@nftstorage/ipfs-cluster').API.TrackerStatus} TrackerStatus
 * @typedef {'Undefined'
 *  | 'ClusterError'
 *  | 'PinError'
 *  | 'UnpinError'
 *  | 'Pinned'
 *  | 'Pinning'
 *  | 'Unpinning'
 *  | 'Unpinned'
 *  | 'Remote'
 *  | 'PinQueued'
 *  | 'UnpinQueued'
 *  | 'Sharded'
 *  | 'UnexpectedlyUnpinned' } PinStatus
 */

/** @type {Record<TrackerStatus, PinStatus>} */
const PinStatusMap = {
  // @ts-ignore
  undefined: 'Undefined',
  cluster_error: 'ClusterError',
  pin_error: 'PinError',
  unpin_error: 'UnpinError',
  pinned: 'Pinned',
  pinning: 'Pinning',
  unpinning: 'Unpinning',
  unpinned: 'Unpinned',
  remote: 'Remote',
  pin_queued: 'PinQueued',
  unpin_queued: 'UnpinQueued',
  sharded: 'Sharded',
  unexpectedly_unpinned: 'UnexpectedlyUnpinned'
}

// Duration between status check polls in ms.
const PIN_STATUS_CHECK_INTERVAL = 5000

// Max time in ms to spend polling for an OK status.
const MAX_PIN_STATUS_CHECK_TIME = 30000

/**
 * List of statuses we don't want to track
 * @type {PinStatus[]}
 */
const PIN_STATUSES_TO_IGNORE = ['Remote']

// Pin statuses considered OK.
export const PIN_OK_STATUS = ['Pinned', 'Pinning', 'PinQueued']

/**
 * Converts from cluster status string to DB pin status enum string.
 * @param {TrackerStatus} trackerStatus
 */
export function toPinStatusEnum (trackerStatus) {
  if (typeof trackerStatus !== 'string') {
    throw new Error(`invalid tracker status: ${trackerStatus}`)
  }
  const status = PinStatusMap[trackerStatus]
  if (!status) {
    throw new Error(`unknown tracker status: ${trackerStatus}`)
  }
  return status
}

/**
 * Function that returns list of pins for given CID.
 *
 * @param {string} cid cid to be looked for
 * @param {import('@nftstorage/ipfs-cluster').Cluster} cluster
 * @param {import('@nftstorage/ipfs-cluster').API.StatusResponse['peerMap']} [peerMap] Optional list of peers, if not provided the fuctions queries the cluster.
 * @return {Promise.<import('@web3-storage/db/db-client-types').PinUpsertInput[]>}
 */
export async function getPins (cid, cluster, peerMap) {
  if (!peerMap) {
    peerMap = (await cluster.status(cid)).peerMap
  }

  let pins = toPins(peerMap)

  // Ignore Remote Pins
  pins = pins.filter(p => !PIN_STATUSES_TO_IGNORE.includes(p.status))

  if (!pins.length) {
    throw new Error('not pinning on any node')
  }

  return pins
}

/**
 * Function that returns list of pins with a PIN_OK_STATUS.
 *
 * @param {string} cid cid to be looked for
 * @param {import('@nftstorage/ipfs-cluster').Cluster} cluster
 * @param {import('@nftstorage/ipfs-cluster').API.StatusResponse['peerMap']} [peerMap] Optional list of peers, if not provided the function queries the cluster.
 * @return {Promise.<import('@web3-storage/db/db-client-types').PinUpsertInput[]>}
 */
async function getOKpins (cid, cluster, peerMap) {
  const pins = await getPins(cid, cluster, peerMap)

  return pins.filter(p => PIN_OK_STATUS.includes(p.status))
}

/**
 * @param {import('@nftstorage/ipfs-cluster').API.StatusResponse['peerMap']} peerMap
 * @return {Array.<import('@web3-storage/db/db-client-types').PinUpsertInput>}
 */
function toPins (peerMap) {
  // Note: `peerId` is the ID of the Cluster node, and is only used for cluster
  // admin. The `ipfsPeerId` can be  used to connect to the underlying ipfs node
  // that stores a given pin, by passing it to `ipfs swarm connect <peerid>`.
  // @ts-ignore
  return Object.entries(peerMap).map(([peerId, { peerName, ipfsPeerId, status }]) => ({
    status: toPinStatusEnum(status),
    location: { peerId, peerName, ipfsPeerId }
  }))
}

/**
 *
 * waitOkPins checks the status of the given CID on the cluster
 * every given `checkInterval` until at least one pin has a PIN_OK_STATUS.
 *
 * After a given maximum `waitTime`, if no OK pins are found the promise is resolved with an empty array.
 *
 * @param {string} cid
 * @param {import('@nftstorage/ipfs-cluster').Cluster} cluster
 * @param {number} waitTime
 * @param {number} checkInterval
 * @return {Promise.<import('@web3-storage/db/db-client-types').PinUpsertInput[]>}
 */
export async function waitOkPins (cid, cluster, waitTime = MAX_PIN_STATUS_CHECK_TIME, checkInterval = PIN_STATUS_CHECK_INTERVAL) {
  const start = Date.now()
  while (Date.now() - start < waitTime) {
    await new Promise(resolve => setTimeout(resolve, checkInterval))
    const okPins = await getOKpins(cid, cluster)
    if (!okPins.length) continue

    return okPins
  }
  return []
}

/**
 * Used to async wait for pins for the provided cid to have an
 * OK_STATUS and update them in the db.
 *
 * @param {string} cid
 * @param {import('@nftstorage/ipfs-cluster').Cluster} cluster
 * @param {import('@web3-storage/db').DBClient} db
 * @param {number} waitTime
 * @param {number} checkInterval
 * @return {Promise.<import('@web3-storage/db/db-client-types').PinUpsertInput[]>}
 */
export async function waitAndUpdateOkPins (cid, cluster, db, waitTime = MAX_PIN_STATUS_CHECK_TIME, checkInterval = PIN_STATUS_CHECK_INTERVAL) {
  const okPins = await waitOkPins(cid, cluster, waitTime, checkInterval)
  const pins = toPinsUpsert(cid, okPins)
  await db.upsertPins(pins)
  return okPins
}

/**
 * @param {string} contentCid
 * @param {import('@web3-storage/db/db-client-types').PinUpsertInput[]} pins
 * @returns {import('@web3-storage/db/db-client-types').PinsUpsertInput[]}
 */
export function toPinsUpsert (contentCid, pins) {
  return pins.map(pin => ({
    id: pin._id,
    status: pin.status,
    contentCid,
    location: pin.location
  }))
}

/**
 * @param {string} contentCid
 * @param {import('@nftstorage/ipfs-cluster').Cluster} cluster
 * @param {import('@web3-storage/db').DBClient} db
 */
export async function fetchAndUpdatePins (contentCid, cluster, db) {
  const statuses = await retry(() => getPins(contentCid, cluster), { retries: 3 })
  const upserts = toPinsUpsert(contentCid, statuses)
  return retry(() => db.upsertPins(upserts), { retries: 3 })
}
