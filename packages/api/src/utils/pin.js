/**
 * @typedef {import('@nftstorage/ipfs-cluster').TrackerStatus} TrackerStatus
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
 *  | 'Sharded'} PinStatus
 */

/** @type {Record<TrackerStatus, PinStatus>} */
const PinStatusMap = {
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
  sharded: 'Sharded'
}

// Duration between status check polls in ms.
const PIN_STATUS_CHECK_INTERVAL = 5000

// Max time in ms to spend polling for an OK status.
const MAX_PIN_STATUS_CHECK_TIME = 30000

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
 * @param {import('@nftstorage/ipfs-cluster').StatusResponse['peerMap']} [peerMap] Optional list of peers, if not provided the fuctions queries the cluster.
 * @return {Promise.<import('@web3-storage/db/db-client-types').PinUpsertInput[]>}
 */
export async function getPins (cid, cluster, peerMap) {
  if (!peerMap) {
    peerMap = (await cluster.status(cid)).peerMap
  }

  const pins = toPins(peerMap)

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
 * @param {import('@nftstorage/ipfs-cluster').StatusResponse['peerMap']} [peerMap] Optional list of peers, if not provided the fuctions queries the cluster.
 * @return {Promise.<import('@web3-storage/db/db-client-types').PinUpsertInput[]>}
 */
export async function getOKpins (cid, cluster, peerMap) {
  const pins = await getPins(cid, cluster, peerMap)

  return pins.filter(p => PIN_OK_STATUS.includes(p.status))
}

/**
 * @param {import('@nftstorage/ipfs-cluster').StatusResponse['peerMap']} peerMap
 * @return {Array.<import('@web3-storage/db/db-client-types').PinUpsertInput>}
 */
export function toPins (peerMap) {
  // Note: `clusterPeerId` is an internal id, and is only used for cluster admin.
  // The `ipfsPeerId` which we rename to `peerId` can be  used to connect to the underlying ipfs node
  // that stores a given pin, by passing it to `ipfs swarm connect <peerid>`.
  return Object.entries(peerMap).map(([clusterPeerId, { peerName, status, ipfsPeerId: peerId }]) => {
    return {
      status: toPinStatusEnum(status),
      location: { peerId, peerName }
    }
  })
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
  for (const pin of okPins) {
    await db.upsertPin(cid, pin)
  }
  return okPins
}
