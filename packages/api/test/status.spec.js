/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import statusWithActiveDeal from './fixtures/pgrest/status-with-active-deal.json'
import statusWithQueuedDeal from './fixtures/pgrest/status-with-queued-deal.json'
import statusWithNoDeal from './fixtures/pgrest/status-with-no-deal.json'

describe('GET /status/:cid', () => {
  it('get pin and deal status', async () => {
    const cid = 'bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm'
    const res = await fetch(new URL(`status/${cid}`, endpoint).toString())
    assert(res.ok, `${JSON.stringify(res)}`)
    const json = await res.json()
    assert.deepStrictEqual(json, statusWithActiveDeal)
  })

  it('get shows initial queued deal', async () => {
    const cid = 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q'
    const res = await fetch(new URL(`status/${cid}`, endpoint).toString())
    assert(res.ok)
    const json = await res.json()
    assert.deepStrictEqual(json, statusWithQueuedDeal)
  })

  it('get shows no deals before aggregate is ready', async () => {
    const cid = 'bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4'
    const res = await fetch(new URL(`status/${cid}`, endpoint).toString())
    assert(res.ok)
    const json = await res.json()
    assert.deepStrictEqual(json, statusWithNoDeal)
  })

  it('get 404 for unknown cid', async () => {
    const cid = 'bafybeihgrtet4vowd4t4iqaspzclxajrwwsesur7zllkahrbhcymfh7kyi'
    const res = await fetch(new URL(`status/${cid}`, endpoint).toString())
    assert(!res.ok)
    assert.strictEqual(res.status, 404)
  })
})
