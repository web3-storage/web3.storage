/**
 * Get a batch of PinRequests and pin them to Piñata.
 * If it works, delete the PinRequest, or update it with a failed attempt.
 *
 * We can only make 3req/s to Piñata max, so we rate limit in the client to 2 req/s
 * As such we'll try batches of 600 and see how we go.
 */
import { gql } from '@web3-storage/db'
import debug from 'debug'
import retry from 'p-retry'

// Note: any other batch size and the request to fetch the PinRequests fails!
const MAX_PIN_REQUESTS_PER_RUN = 600
const log = debug('pinpin')

const FIND_BATCH = gql`
  query FindAllPinRequests($size: Int!) {
    findAllPinRequests(_size: $size) {
      data {
        _id
        cid
        created
      }
    }
  }
`

const DELETE_PIN_REQUESTS = gql`
  mutation DeletePinRequests($requests: [ID!]!) {
    deletePinRequests(requests: $requests){
      _id
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
    console.log('ℹ️ Enable logging by setting DEBUG=pinpin')
  }
  log('📡 Fetcing Pin Requests from DB')
  const pinReqs = await retry(() => getPinRequests(db), { onFailedAttempt: log })

  const total = pinReqs.length
  const pinned = []
  let count = 0

  log(`📥 Processing ${total} Pin Requests`)
  // Launch all the requests in parallel and let the rate-limiter optimise it.
  await Promise.all(pinReqs.map(({ _id, cid, created }) => {
    return pinata.pinByHash(cid)
      .then(() => {
        count++
        pinned.push(_id)
        log(`📌 ${cid} ${count}/${total} pinned on Pinata! Request created: ${created}`)
      })
      .catch((err) => {
        count++
        log(`💥 ${cid} ${count}/${total} failed to pin! Request created: ${created}`, err)
      })
  }))

  log(`📡 Deleting ${pinned.length} processed Pin Requests`)
  await retry(() => db.query(DELETE_PIN_REQUESTS, { requests: pinned }), { onFailedAttempt: log })

  log(`🎉 Done! Pinned ${pinned.length} of ${total}`)
  return { total, pinned }
}
