import throttledQueue from 'throttled-queue'

/**
 * Create a rate limiter which doesn't limit at all
 */
export function createUnboundRateLimiter () {
  const throttle = throttledQueue(Infinity, 1000)
  return () => throttle(() => {})
}
