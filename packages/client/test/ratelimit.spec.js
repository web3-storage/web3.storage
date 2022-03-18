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
      while (elapsedTime() < timePeriod) {
        await rateLimiter()
        numRequests++
      }
    })()
    // throttledQueue has an off-by-one error, hence the plus one
    assert.equal(numRequests, requestsLimit + 1)
  })
})
