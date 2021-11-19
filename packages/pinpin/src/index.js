/**
 * Get a batch of PinRequests and pin them to Piñata.
 * If it works, delete the PinRequest, or update it with a failed attempt.
 *
 * We can only make 3req/s to Piñata max, so we rate limit in the client to 2 req/s
 * As such we'll try batches of 600 and see how we go.
 */
import debug from 'debug'
import retry from 'p-retry'

// Note: any other batch size and the request to fetch the PinRequests fails!
const MAX_PIN_REQUESTS_PER_RUN = 400
const log = debug('pinpin')

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
  const pinReqs = await retry(() => db.getPinRequests({ size: MAX_PIN_REQUESTS_PER_RUN }), { onFailedAttempt: log })

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
  await retry(() => db.deletePinRequests(pinned), { onFailedAttempt: log })

  log(`🎉 Done! Pinned ${pinned.length} of ${total}`)
  return { total, pinned }
}
