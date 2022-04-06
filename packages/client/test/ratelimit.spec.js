/* eslint-env mocha */
import * as assert from 'uvu/assert'
import { createRateLimiter } from 'web3.storage'

describe('rate limiter', () => {
  it('limits to correct rate', async () => {
    const requestsLimit = 3
    const timePeriod = 100
    const rateLimiter = createRateLimiter(requestsLimit, timePeriod)
    const start = new Date()
    const elapsedTime = () => (new Date()) - start
    // Check how many times the rate limiter returns within the time period
    let numRequests = 0
    await (async () => {
      while (true) {
        await rateLimiter()
        // If the rate limiter waited until the end of the time period before returning, then don't
        // count it, as it belongs to the next period
        if (elapsedTime() >= timePeriod) {
          break
        }
        numRequests++
      }
    })()
    assert.equal(numRequests, requestsLimit)
  })
})
