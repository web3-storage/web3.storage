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
const PIN_OK_STATUS = ['Pinned', 'Pinning', 'PinQueued']

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
 * Function that returns list of pins considered ok.
 * TODO: refactor car upload to use this instead.
 *
 * @param {string} cid cid to be looked for
 * @param {import('@nftstorage/ipfs-cluster').Cluster} cluster
 * @param {import('@nftstorage/ipfs-cluster').StatusResponse['peerMap']} [peerMap] Optional list of peers, if not provided the fuctions queries the cluster.
 * @return {Promise.<import('@web3-storage/db/db-client-types').PinUpsertInput[]>}
 */
export async function getOKpins (cid, cluster, peerMap) {
  if (!peerMap) {
    const status = await cluster.status(cid)
    peerMap = status.peerMap
  }
  const pins = toPins(peerMap)

  // TODO To validate: I expect in case of a pinning request it's acceptable to have no pins here?
  // if (!pins.length) { // should not happen
  //   throw new Error('not pinning on any node')
  // }

  return pins.filter(p => PIN_OK_STATUS.includes(p.status))
}

/**
 * @param {import('@nftstorage/ipfs-cluster').StatusResponse['peerMap']} peerMap
 * @return {Array.<import('@web3-storage/db/db-client-types').PinUpsertInput>}
 */
export function toPins (peerMap) {
  return Object.entries(peerMap).map(([peerId, { peerName, status }]) => ({
    status: toPinStatusEnum(status),
    location: { peerId, peerName }
  }))
}

/**
 *
 * @param {string} cid
 * @param {import('@nftstorage/ipfs-cluster').Cluster} cluster
 * @param {number} waitTime
 * @param {number} checkInterval
 * @return {Promise.<import('@web3-storage/db/db-client-types').PinUpsertInput[]>}
 */
export async function waitToGetOkPins (cid, cluster, waitTime = MAX_PIN_STATUS_CHECK_TIME, checkInterval = PIN_STATUS_CHECK_INTERVAL) {
  const start = Date.now()
  while (Date.now() - start > waitTime) {
    await new Promise(resolve => setTimeout(resolve, checkInterval))
    const okPins = await getOKpins(cid, cluster)
    if (!okPins.length) continue

    return okPins
  }
  return []
}
