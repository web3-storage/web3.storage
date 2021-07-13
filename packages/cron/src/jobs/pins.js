import debug from 'debug'
import { gql } from '@web3-storage/db'

const log = debug('pins:updatePinStatuses')

const FIND_PINS_QUERY = gql`
  query FindPinsByStatus($after: String) {
    findPinsByStatus(statuses: [Unpinned, PinQueued, Pinning], _size: 1000, _after: $after) {
      data {
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
      }
      after
    }
  }
`

/**
 * @param {{
 *   cluster: import('@nftstorage/ipfs-cluster').Cluster
 *   db: import('@web3-storage/db').DBClient
 *   env: Record<string, string|undefined>
 *   ipfs: import('../lib/ipfs').IPFS
 * }} config
 */
export async function updatePinStatuses ({ cluster, db, env, ipfs }) {
  if (!log.enabled) {
    console.log('Enable logging by setting DEBUG=pins:updatePinStatuses')
  }

  let queryRes, after
  while (true) {
    queryRes = await db.query(FIND_PINS_QUERY, { after })
    const updates = []
    for (const pin of queryRes.findPinsByStatus.data) {
      const { peerMap } = await cluster.status(pin.content.cid)
      for (const [peerId, { status }] of Object.entries(peerMap)) {

      }
    }
    after = queryRes.findPinsByStatus.after
    if (!after) break
  }
  log('🎉 Done')

  const namespaces = await cf.fetchKVNamespaces()
  const followupsNs = findNs(namespaces, env, 'FOLLOWUPS')
  const pinsNs = findNs(namespaces, env, 'PINS')
  log(`🎯 Updating ${pinsNs.title} from ${followupsNs.title}`)

  let i = 0
  for await (const keys of cf.fetchKVKeys(followupsNs.id)) {
    log(`📥 Processing ${i} -> ${i + keys.length}`)

    /**
     * @typedef {import('../lib/cloudflare.js').BulkWritePair} BulkWritePair
     * @type {{ pins: BulkWritePair[], followups: BulkWritePair[] }}
     */
    const bulkWrites = { pins: [], followups: [] }
    /**
     * @type {{ followups: string[] }}
     */
    const bulkDeletes = { followups: [] }

    await Promise.all(
      keys.map(async (k) => {
        const { name: cid, metadata: pin } = k
        try {
          const pinStatus = toPSAStatus(await cluster.status(cid))
          if (pinStatus === pin.status) return // not changed since last check

          const prevPin = { ...pin }
          pin.status = pinStatus
          // for successful pin we can update the size
          if (pinStatus === 'pinned') {
            pin.size = await ipfs.dagSize(cid, { timeout: 5 * 60000 })
          }

          bulkWrites.pins.push({ key: cid, value: '', metadata: pin })
          // remove followup or update if still in progress
          if (isPinnedOrFailed(pinStatus)) {
            bulkDeletes.followups.push(cid)
          } else {
            bulkWrites.followups.push({ key: cid, value: '', metadata: pin })
          }

          log(
            `${cid}: status ${prevPin.status} => ${pin.status}, size ${prevPin.size} => ${pin.size}`
          )
        } catch (err) {
          err.message = `following up on ${cid}: ${err.message}`
          console.error(err)
        }
      })
    )

    if (bulkWrites.pins.length) {
      log(`🗂 updating statuses for ${bulkWrites.pins.length} pins`)
      await cf.writeKVMulti(pinsNs.id, bulkWrites.pins)
    }
    if (bulkDeletes.followups.length) {
      log(`🗑 removing ${bulkDeletes.followups.length} followups`)
      await cf.deleteKVMulti(followupsNs.id, bulkDeletes.followups)
    }
    if (bulkWrites.followups.length) {
      log(`🗂 updating ${bulkWrites.pins.length} followups`)
      await cf.writeKVMulti(followupsNs.id, bulkWrites.followups)
    }

    i += keys.length
  }
}

/**
 * @param {string} status
 */
function isPinnedOrFailed(status) {
  return ['pinned', 'failed'].includes(status)
}

/**
 * Best effort conversion from cluster status to pinning service API status.
 * @param {import('@nftstorage/ipfs-cluster').StatusResponse} status
 * @returns {import('nft.storage/src/lib/interface').PinStatus}
 */
export function toPSAStatus(status) {
  const pinInfos = Object.values(status.peerMap)
  if (pinInfos.some((i) => i.status === 'pinned')) return 'pinned'
  if (pinInfos.some((i) => i.status === 'pinning')) return 'pinning'
  if (pinInfos.some((i) => i.status === 'queued')) return 'queued'
  return 'failed'
}
