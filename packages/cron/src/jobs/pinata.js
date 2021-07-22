/**
 * Get a batch of PinRequests and pin them to Piñata.
 * If it works, delete the PinRequest, or update it with a failed attempt.
 *
 * We can only make 3req/s to Piñata max, so we rate limit in the client to 2 req/s
 * As such we'll try batches of 600 and see how we go.
 */
import { gql } from '@web3-storage/db'
import debug from 'debug'

const log = debug('pinata')
const MAX_ATTEMPTS = 100
// At 2req/s to pinata, we can do max 1200 reqs per 10 mins, we do less to keep things happy.
const MAX_PIN_REQUESTS_PER_RUN = 600

const FIND_BATCH = gql`
  query FindAllPinRequests($size: Int!) {
    findAllPinRequests(_size: $size) {
      data {
        _id
        cid
        attempts
      }
    }
  }
`

const DELETE_ONE = gql`
  mutation DeletePinRequest($_id: ID!) {
    deletePinRequest(id: $_id){
      _id
    }
  }
`

const INCREMENT_ATTEMPTS = gql`
  mutation IncrementPinRequestAttempts($_id: ID!) {
    incrementPinRequestAttempts(id: $_id) {
      _id
      cid
      attempts
    }
  }
`

/**
 * Fetch a batch of PinRequests with CIDs to pin
 *
 * @param {import('@web3-storage/db').DBClient} db
 * @returns {Array<{_id: string, cid: string}>}
 */
async function getPinRequests (db) {
  const size = MAX_PIN_REQUESTS_PER_RUN
  const res = await db.query(FIND_BATCH, { size })
  return res.findAllPinRequests.data
}

/**
 * Find PinRequests and pin them to Piñata
 *
 * @param {{
 *   db: import('@web3-storage/db').DBClient
 *   pinata: import('../lib/pinata').Pinata
 * }} config
 */
export async function pinToPinata ({ db, pinata }) {
  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=pinata')
  }
  log('📡 Fetcing Pin Requests from DB')
  const pinReqs = await getPinRequests(db)

  const total = pinReqs.length
  let count = 0
  let ok = 0
  log(`📥 Processing ${total} Pin Requests`)
  for (const { _id, cid, attempts } of pinReqs) {
    count++
    try {
      // TODO: could fetch PeerIDs of pins from db, or ask cluster,
      // and then inspect the dnsaddrs to find the current node multiaddrs,
      // and set them as the origins, or... not! Just use the DHT! Let piñata find them CIDs.
      // Note: setting origins that are not currently reachable may be worse: https://github.com/ipfs-shipyard/nft.storage/issues/260
      await pinata.pinByHash(cid)
      log(`📌 ${cid} ${count}/${total} pinned on Pinata! `)
      // Remove from the queue. Not awaiting, just move on.
      db.query(DELETE_ONE, { _id })
      ok++
    } catch (err) {
      if (attempts < MAX_ATTEMPTS) {
        log(`💥 ${cid} ${count}/${total} failed to pin. ${MAX_ATTEMPTS - (attempts + 1)} tries left`, err)
        db.query(INCREMENT_ATTEMPTS, { _id })
      } else {
        log(`❌ ${cid} ${count}/${total} failed to pin ${attempts} times. Deleting Pin Request`, err)
        db.query(DELETE_ONE, { _id })
      }
    }
  }
  log(`🎉 Done! Pinned ${ok} of ${total}`)
}
