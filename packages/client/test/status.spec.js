/* eslint-env mocha */
import * as assert from 'uvu/assert'
import { Web3Storage, createRateLimiter } from 'web3.storage'

describe('status', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')
  const rateLimiter = createRateLimiter(Infinity, 1000)

  it('returns an object', async () => {
    const client = new Web3Storage({ token, endpoint, rateLimiter })
    const cid = 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e'
    const status = await client.status(cid)
    assert.is(status.cid, cid)
    assert.ok(status.dagSize)
    assert.ok(status.created)
    assert.ok(status.deals)
    assert.ok(status.pins)
  })

  it('returns undefined on 404', async () => {
    const client = new Web3Storage({ token, endpoint, rateLimiter })
    const cid = 'unknown'
    const status = await client.status(cid)
    assert.is(status, undefined)
  })

  it('throws on error', async () => {
    const client = new Web3Storage({ token, endpoint, rateLimiter })
    const cid = 'error'
    try {
      await client.status(cid)
      assert.unreachable()
    } catch (err) {
      assert.is(err.message, 'Internal Server Error')
    }
  })
})
