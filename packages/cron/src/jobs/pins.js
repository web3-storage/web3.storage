import debug from 'debug'
import { toPinStatusEnum } from '@web3-storage/api/src/utils/pin.js'
import retry from 'p-retry'
import { downgradeCid } from '../lib/cid.js'

/**
 * @typedef {import('@nftstorage/ipfs-cluster').API.PinInfo} PinInfo
 * @typedef {Record<string, PinInfo>} PeerMap
 */

const MAX_PIN_REQUESTS_PER_RUN = 1000
/**
 * 8k max request length to cluster for statusAll, we hit this at around 126 CIDs
 * http://nginx.org/en/docs/http/ngx_http_core_module.html#large_client_header_buffers
 */
const MAX_CLUSTER_STATUS_CIDS = 120
const log = debug('pins:updatePinStatuses')

/**
 * @param {{
 *   cluster: import('@nftstorage/ipfs-cluster').Cluster
 *   db: import('@web3-storage/db').DBClient
 * }} config
 */
export async function updatePinStatuses ({ cluster, db }) {
  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=pins:updatePinStatuses')
  }

  const to = new Date().toISOString()
  const size = MAX_PIN_REQUESTS_PER_RUN
  let queryRes, after
  let i = 0
  while (true) {
    queryRes = await retry(() => db.getPinSyncRequests({ to, after, size }), { onFailedAttempt: log })

    const requests = queryRes.data
    log(`📥 Processing ${i} -> ${i + requests.length}`)

    const cids = Array.from(new Set(requests.map(r => r.pin.contentCid)))
    log(`ℹ️ ${cids.length} deduped CIDs`)
    /** @type {Map<string, PeerMap>} */
    let statuses = new Map()
    try {
      statuses = await getPinStatuses(cluster, cids)
    } catch (err) {
      log('⚠️ failed to get pin statuses from cluster', err)
      // ok to continue - these CIDs will be re-added to the back of the queue
    }

    const reSyncPins = []
    let pinUpdates = await Promise.all(requests.map(async req => {
      const { pin } = req
      let peerMap = statuses.get(pin.contentCid)
      if (!peerMap) {
        reSyncPins.push(pin)
        return null
      }

      let pinInfo = peerMap[pin.location.peerId]
      if (!pinInfo) {
        log(`⚠️ ${pin.contentCid} is not tracked by our cluster!`)
        return null
      }

      let status = toPinStatusEnum(pinInfo.status)

      // If "Unpinned" downgrade to v0 CID
      if (status === 'Unpinned') {
        log(`⚠️ ${pin.contentCid} is Unpinned on ALL Cluster nodes`)

        let cidV0
        try {
          cidV0 = downgradeCid(pin.contentCid)
          log(`⬇️ downgraded ${pin.contentCid} -> ${cidV0}`)
        } catch (err) {
          log(`⚠️ Unable to downgrade CID: ${pin.contentCid}`)
          reSyncPins.push(pin)
          return null
        }

        try {
          const res = await cluster.status(cidV0)
          peerMap = res.peerMap
        } catch (err) {
          reSyncPins.push(pin)
          return null
        }

        pinInfo = peerMap[pin.location.peerId]
        if (!pinInfo) {
          log(`⚠️ ${cidV0} is not tracked by our cluster!`)
          return null
        }

        status = toPinStatusEnum(pinInfo.status)
      }

      if (status !== 'Pinned' && status !== 'Remote') reSyncPins.push(pin)

      if (status === pin.status) {
        log(`🙅 ${pin.contentCid}@${pin.location.peerId}: No status change (${status})`)
        return null
      }

      log(`📌 ${pin.contentCid}@${pin.location.peerId}: ${pin.status} => ${status}`)

      return {
        id: pin._id,
        status: status,
        cid: pin.contentCid,
        locationId: pin.location._id
      }
    }))

    pinUpdates = pinUpdates.filter(Boolean)

    log(`⏳ Updating ${pinUpdates.length} pins...`)
    if (pinUpdates.length) {
      await retry(() => db.upsertPins(pinUpdates), { onFailedAttempt: log })
    }
    log(`✅ Updated ${pinUpdates.filter(Boolean).length} pins...`)

    log(`⏳ Removing ${requests.length} pin sync requests...`)
    if (requests.length) {
      await retry(() => db.deletePinSyncRequests(requests.map(r => r._id)), { onFailedAttempt: log })
    }
    log(`✅ Removed ${requests.length} pin sync requests...`)

    log(`⏳ Re-queuing ${reSyncPins.length} pin sync requests...`)
    if (reSyncPins.length) {
      await retry(() => db.createPinSyncRequests(reSyncPins.map(p => p._id)), { onFailedAttempt: log })
    }
    log(`✅ Re-queued ${reSyncPins.length} pin sync requests...`)

    after = queryRes.after
    if (!after) break
    i += requests.length
  }
  log('🎉 Done')
}

/**
 * Gets statuses for the passed CIDs, automatically batching them.
 * @param {import('@nftstorage/ipfs-cluster').Cluster} cluster
 * @param {string[]} cids
 * @returns {Promise<Map<string, PeerMap>>}
 */
async function getPinStatuses (cluster, cids) {
  /** @type {Map<string, PeerMap>} */
  const statuses = new Map()

  const batches = cids.reduce((batches, cid) => {
    let batch = batches[batches.length - 1]
    if (!batch || batch.length >= MAX_CLUSTER_STATUS_CIDS) {
      batch = []
      batches.push(batch)
    }
    batch.push(cid)
    return batches
  }, [])

  for (const cids of batches) {
    const res = await cluster.statusAll({ cids })
    res.forEach(s => statuses.set(s.cid, s.peerMap))
  }

  return statuses
}
