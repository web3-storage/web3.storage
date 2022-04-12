/* eslint-env mocha */
import * as assert from 'uvu/assert'
import { createRateLimiter } from 'web3.storage'

// these must be the same as the values used by createRateLimiter
const RATE_LIMIT_REQUESTS = 30
const RATE_LIMIT_PERIOD = 10 * 1000

describe('rate limiter', () => {
  it('limits to correct rate', async function () {
    this.timeout(RATE_LIMIT_PERIOD * 2)
    const rateLimiter = createRateLimiter()
    const start = new Date()
    const elapsedTime = () => (new Date()) - start
    // Check how many times the rate limiter returns within the time period
    let numRequests = 0
    await (async () => {
      while (true) {
        await rateLimiter()
        // If the rate limiter waited until the end of the time period before returning, then don't
        // count it, as it belongs to the next period
        if (elapsedTime() >= RATE_LIMIT_PERIOD) {
          break
        }
        numRequests++
      }
    })()
    assert.equal(numRequests, RATE_LIMIT_REQUESTS)
  })
})
