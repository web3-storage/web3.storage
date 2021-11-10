/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'

describe('GET /status/:cid', () => {
  it('get pin and deal status', async () => {
    const cid = 'bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm'
    const res = await fetch(new URL(`status/${cid}`, endpoint))
    assert(res.ok, `${JSON.stringify(res)}`)
    const json = await res.json()
    assert.deepStrictEqual(json, {
      cid: 'bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm',
      created: '2021-07-14T19:27:14.934572Z',
      dagSize: 101,
      pins: [{
        peerId: '12D3KooWR1Js',
        peerName: 'who?',
        region: 'where?',
        status: 'Pinned',
        updated: '2021-07-14T19:27:14.934572Z'
      }],
      deals: [{
        dealId: 12345,
        storageProvider: 'f99',
        status: 'Active',
        pieceCid: 'baga',
        dataCid: 'bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm',
        dataModelSelector: 'Links/0/Links',
        activation: '<iso timestamp>',
        created: '2021-07-14T19:27:14.934572Z',
        updated: '2021-07-14T19:27:14.934572Z'
      }]
    })
  })

  it('get shows initial queued deal', async () => {
    const cid = 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q'
    const res = await fetch(new URL(`status/${cid}`, endpoint))
    assert(res.ok)
    const json = await res.json()
    assert.deepStrictEqual(json, {
      cid,
      created: '2021-07-14T19:27:14.934572Z',
      dagSize: 101,
      pins: [{
        peerId: '12D3KooWR1Js',
        peerName: 'who?',
        region: 'where?',
        status: 'Pinned',
        updated: '2021-07-14T19:27:14.934572Z'
      }],
      deals: [{
        status: 'Queued',
        pieceCid: 'baga',
        dataCid: 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q',
        dataModelSelector: 'Links/0/Links'
      }]
    })
  })

  it('get shows no deals before aggregate is ready', async () => {
    const cid = 'bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4'
    const res = await fetch(new URL(`status/${cid}`, endpoint))
    assert(res.ok)
    const json = await res.json()
    assert.deepStrictEqual(json, {
      cid,
      created: '2021-07-14T19:27:14.934572Z',
      dagSize: 101,
      pins: [{
        peerId: '12D3KooWR1Js',
        peerName: 'who?',
        region: 'where?',
        status: 'Pinned',
        updated: '2021-07-14T19:27:14.934572Z'
      }],
      deals: []
    })
  })

  it('get 404 for unknown cid', async () => {
    const cid = 'bafybeihgrtet4vowd4t4iqaspzclxajrwwsesur7zllkahrbhcymfh7kyi'
    const res = await fetch(new URL(`status/${cid}`, endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 404)
  })
})
