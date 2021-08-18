import debug from 'debug'
import { gql } from '@web3-storage/db'
import { toPinStatusEnum } from '@web3-storage/api/src/utils/pin.js'
import retry from 'p-retry'
import { piggyback } from 'piggybacker'

const log = debug('pins:updatePinStatuses')

const FIND_PIN_SYNC_REQUESTS = gql`
  query FindPinSyncRequests($status: PinStatus!, $from: Time! $after: String) {
    findPinSyncRequests(_size: 500, _cursor: $after) {
      data {
        _id
        pin {
          _id
          content {
            _id
            cid
            dagSize
          }
          location {
            peerId
          }
          status
          created
        }
      }
      after
    }
  }
`

const UPDATE_PINS = gql`
  mutation UpdatePins($pins: [UpdatePinInput!]!) {
    updatePins(pins: $pins) {
      _id
    }
  }
`

const UPDATE_CONTENT_DAG_SIZE = gql`
  mutation UpdateContentDagSize($content: ID!, $dagSize: Long!) {
    updateContentDagSize(content: $content, dagSize: $dagSize) {
      _id
    }
  }
`

const DELETE_PIN_SYNC_REQUESTS = gql`
  mutation DeletePinSyncRequests($requests: [ID!]!) {
    deletePinSyncRequests(requests: $requests) {
      _id
    }
  }
`

const CREATE_PIN_SYNC_REQUESTS = gql`
  mutation CreatePinSyncRequests($pins: [ID!]!) {
    createPinSyncRequests(pins: $pins) {
      _id
    }
  }
`

/**
 * @param {{
 *   cluster: import('@nftstorage/ipfs-cluster').Cluster
 *   db: import('@web3-storage/db').DBClient
 *   ipfs: import('../lib/ipfs').IPFS
 * }} config
 */
export async function updatePinStatuses ({ cluster, db, ipfs }) {
  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=pins:updatePinStatuses')
  }

  // Cached status responses - since we pin on multiple nodes we'll often ask
  // multiple times about the same CID.
  /** @type {Map<string, import('@nftstorage/ipfs-cluster').StatusResponse['peerMap']>} */
  const statusCache = new Map()
  // List of CIDs that we already updated the DAG size for and don't need to do
  // get the size or update again.
  /** @type {Set<string>} */
  const updatedDagSizes = new Set()

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

  let queryRes, after
  let i = 0
  while (true) {
    queryRes = await retry(() => db.query(FIND_PIN_SYNC_REQUESTS, { after }), { onFailedAttempt: log })
    const requests = queryRes.findPinSyncRequests.data
    log(`📥 Processing ${i} -> ${i + requests.length}`)

    const checkDagSizePins = []
    const reSyncPins = []
    let pinUpdates = await Promise.all(requests.map(async req => {
      const { pin } = req
      const peerMap = await getPinStatus(pin.content.cid)

      if (!peerMap[pin.location.peerId]) {
        return null // not tracked by our cluster
      }

      const status = toPinStatusEnum(peerMap[pin.location.peerId].status)
      if (status === pin.status) {
        log(`🙅 ${pin.content.cid}@${pin.location.peerId}: No status change (${status})`)
        reSyncPins.push(pin)
        return null
      }

      if (status === 'Pinned' && !pin.content.dagSize && !updatedDagSizes.has(pin.content.cid)) {
        checkDagSizePins.push(pin)
        updatedDagSizes.add(pin.content.cid)
      }

      if (status !== 'Pinned') {
        reSyncPins.push(pin)
      }

      log(`📌 ${pin.content.cid}@${pin.location.peerId}: ${pin.status} => ${status}`)
      return { pin: pin._id, status: status }
    }))
    pinUpdates = pinUpdates.filter(Boolean)

    log(`⏳ Updating ${pinUpdates.length} pins...`)
    if (pinUpdates.length) {
      await retry(() => db.query(UPDATE_PINS, {
        pins: pinUpdates
      }), { onFailedAttempt: log })
    }
    log(`✅ Updated ${pinUpdates.filter(Boolean).length} pins...`)

    log(`⏳ Removing ${requests.length} pin sync requests...`)
    if (requests.length) {
      await retry(() => db.query(DELETE_PIN_SYNC_REQUESTS, {
        requests: requests.map(r => r._id)
      }), { onFailedAttempt: log })
    }
    log(`✅ Removed ${requests.length} pin sync requests...`)

    log(`⏳ Re-queuing ${reSyncPins.length} pin sync requests...`)
    if (reSyncPins.length) {
      await retry(() => db.query(CREATE_PIN_SYNC_REQUESTS, {
        pins: reSyncPins.map(p => p._id)
      }), { onFailedAttempt: log })
    }
    log(`✅ Re-queued ${reSyncPins.length} pin sync requests...`)

    await Promise.all(checkDagSizePins.map(async pin => {
      log(`⏳ ${pin.content.cid}: Querying DAG size...`)
      let dagSize
      try {
        // Note: this will timeout for large DAGs
        dagSize = await ipfs.dagSize(pin.content.cid, { timeout: 10 * 60000 })
        log(`🛄 ${pin.content.cid}@${pin.location.peerId}: ${dagSize} bytes`)
        await retry(() => db.query(UPDATE_CONTENT_DAG_SIZE, { content: pin.content._id, dagSize }), { onFailedAttempt: log })
      } catch (err) {
        log(`💥 ${pin.content.cid}@${pin.location.peerId}: Failed to update DAG size`)
        log(err)
      }
    }))

    after = queryRes.findPinSyncRequests.after
    if (!after) break
    i += requests.length
  }
  log('🎉 Done')
}
