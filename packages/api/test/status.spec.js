/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'

describe('GET /status/:cid', () => {
  it('get pin and deal status', async () => {
    const cid = 'testcid'
    const res = await fetch(new URL(`status/${cid}`, endpoint))
    assert(res.ok)
    const json = await res.json()
    assert.deepStrictEqual(json, {
      cid: 'testcid',
      dagSize: 101,
      pins: [{
        peerId: '12D3KooWR1Js',
        peerName: 'who?',
        region: 'where?',
        status: 'Pinned'
      }],
      deals: [{
        dealId: 12345,
        miner: 'f99',
        status: 'Active',
        activation: '<iso timestamp>',
        pieceCid: 'baga',
        dataCid: 'bafy',
        dataModelSelector: 'Links/0/Links'
      }]
    })
  })

  it('get shows initial queued deal', async () => {
    const cid = 'nodeal'
    const res = await fetch(new URL(`status/${cid}`, endpoint))
    assert(res.ok)
    const json = await res.json()
    assert.deepStrictEqual(json, {
      cid,
      dagSize: 101,
      pins: [{
        peerId: '12D3KooWR1Js',
        peerName: 'who?',
        region: 'where?',
        status: 'Pinned'
      }],
      deals: [{
        status: 'Queued',
        pieceCid: 'baga',
        dataCid: 'bafy',
        dataModelSelector: 'Links/0/Links'
      }]
    })
  })

  it('get shows no deals before batch is ready', async () => {
    const cid = 'nobatch'
    const res = await fetch(new URL(`status/${cid}`, endpoint))
    assert(res.ok)
    const json = await res.json()
    assert.deepStrictEqual(json, {
      cid,
      dagSize: 101,
      pins: [{
        peerId: '12D3KooWR1Js',
        peerName: 'who?',
        region: 'where?',
        status: 'Pinned'
      }],
      deals: []
    })
  })

  it('get 404 for unknown cid', async () => {
    const cid = 'unknown'
    const res = await fetch(new URL(`status/${cid}`, endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 404)
  })
})
