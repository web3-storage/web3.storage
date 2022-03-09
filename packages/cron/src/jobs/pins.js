import debug from 'debug'
import { toPinStatusEnum } from '@web3-storage/api/src/utils/pin.js'
import retry from 'p-retry'
import { piggyback } from 'piggybacker'
import { downgradeCid } from '../lib/cid.js'

/**
 * @typedef {import('@nftstorage/ipfs-cluster').API.PinInfo} PinInfo
 * @typedef {Record<string, PinInfo>} PeerMap
 */

const MAX_PIN_REQUESTS_PER_RUN = 400
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

  // Cached status responses - since we pin on multiple nodes we'll often ask
  // multiple times about the same CID.
  /** @type {Map<string, PeerMap>} */
  const statusCache = new Map()

  /** @type {(cid: string) => Promise<PeerMap>} */
  const getPinStatus = piggyback(
    async cid => {
      let peerMap = statusCache.get(cid)
      if (peerMap) {
        log(`🥊 ${cid}: Cache hit for status...`)
      } else {
        log(`⏳ ${cid}: Checking status...`)
        ;({ peerMap } = await cluster.status(cid))
        statusCache.set(cid, peerMap)
      }
      return peerMap
    },
    cid => cid
  )

  const to = new Date().toISOString()
  const size = MAX_PIN_REQUESTS_PER_RUN
  let queryRes, after
  let i = 0
  while (true) {
    queryRes = await retry(() => db.getPinSyncRequests({ to, after, size }), { onFailedAttempt: log })

    const requests = queryRes.data
    log(`📥 Processing ${i} -> ${i + requests.length}`)

    const reSyncPins = []
    let pinUpdates = await Promise.all(requests.map(async req => {
      const { pin } = req
      /** @type {PeerMap} */
      let peerMap

      // Get status of pin or check later
      try {
        peerMap = await getPinStatus(pin.contentCid)
      } catch (err) {
        reSyncPins.push(pin)
        return null // Cluster could not find the content, please check later
      }

      let pinInfo = Object.values(peerMap).find(i => pin.location.peerId === i.ipfsPeerId)
      if (!pinInfo) {
        log(`⚠️ ${pin.contentCid} is not tracked by our cluster!`)
        return null
      }

      let status = toPinStatusEnum(pinInfo.status)

      // If "Unpinned" downgrade to v0 CID
      if (status === 'Unpinned') {
        let cidV0
        try {
          cidV0 = downgradeCid(pin.contentCid)
        } catch (err) {
          log(`⚠️ Unable to downgrade CID: ${pin.contentCid}`)
          reSyncPins.push(pin)
          return null
        }

        try {
          peerMap = await getPinStatus(cidV0)
        } catch (err) {
          reSyncPins.push(pin)
          return null
        }

        pinInfo = Object.values(peerMap).find(i => pin.location.peerId === i.ipfsPeerId)
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
        location: pin.location
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
