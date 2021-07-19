import debug from 'debug'
import { gql } from '@web3-storage/db'
import { toPinStatusEnum } from 'web3.storage-api/src/utils/pin.js'

const log = debug('pins:updatePinStatuses')

const FIND_PINS = gql`
  query FindPinsByStatus($after: String) {
    findPinsByStatus(statuses: [Unpinned, PinQueued, Pinning], _size: 1000, _cursor: $after) {
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

const CREATE_OR_UPDATE_PIN = gql`
  mutation CreateOrUpdatePin($data: CreateOrUpdatePinInput!) {
    createOrUpdatePin(data: $data) {
      _id
    }
  }
`

const UPDATE_CONTENT_DAG_SIZE = gql`
  mutation UpdateContentDagSize($content: ID!, $dagSize: Int!) {
    updateContentDagSize(content: $content, dagSize: $dagSize) {
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

  let queryRes, after
  let i = 0
  while (true) {
    queryRes = await db.query(FIND_PINS, { after })
    log(`📥 Processing ${i} -> ${i + queryRes.findPinsByStatus.data.length}`)
    for (const pin of queryRes.findPinsByStatus.data) {
      const { peerMap } = await cluster.status(pin.content.cid)

      if (!peerMap[pin.location.peerId]) {
        continue // not tracked by our cluster
      }

      const status = toPinStatusEnum(peerMap[pin.location.peerId].status)
      if (status === pin.status) {
        log(`🙅‍♂️ ${pin.content.cid}: No status change for ${pin.content.cid}`)
        continue
      }

      log(`📌 ${pin.content.cid}: ${pin.status} => ${status}`)
      await db.query(CREATE_OR_UPDATE_PIN, {
        data: {
          content: pin.content._id,
          status: status,
          location: {
            peerId: pin.location.peerId,
            peerName: peerMap[pin.location.peerId].peerName
          }
        }
      })

      if (status === 'Pinned' && !pin.content.dagSize) {
        log(`⏳ ${pin.content.cid}: Querying DAG size...`)
        let dagSize
        try {
          // Note: this will timeout for large DAGs
          dagSize = await ipfs.dagSize(pin.content.cid, { timeout: 10 * 60000 })
          log(`🛄 ${pin.content.cid}: ${dagSize} bytes`)
          await db.query(UPDATE_CONTENT_DAG_SIZE, { content: pin.content._id, dagSize })
        } catch (err) {
          log(`💥 ${pin.content.cid}: Failed to update DAG size`)
          log(err)
        }
      }
    }

    after = queryRes.findPinsByStatus.after
    if (!after) break
    i += queryRes.findPinsByStatus.data.length
  }
  log('🎉 Done')
}
