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
})
