/* eslint-env mocha */
import * as assert from 'uvu/assert'
import { Web3Storage } from 'web3.storage'

describe('list', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('fetches all uploads for account', async () => {
    const client = new Web3Storage({ token, endpoint })
    const uploads = []
    for await (const item of client.list()) {
      uploads.push(item)
    }
    assert.is(uploads.length, 102)
    assert.equal(uploads[0], { name: 'web3-storage-web3.storage-205-0bb68d74', cid: 'bafybeie4aoxk72buraibbf2o4f4gfa3pvvb45ay2zlhtlkzgqguj2ubv4e', created: '2021-07-28T10:43:26.055922Z', dagSize: 2398655, pins: [], deals: [] })
    assert.equal(uploads[uploads.length - 1], { name: 'not-distributed.jpg', cid: 'bafybeig3zgiasqh7bsmvc5cudkkeeh3qborbscua3eqqky7m7fbzgrb4qu', created: '2021-07-14T19:16:55.233593Z', dagSize: null, pins: [], deals: [] })
  })

  it('fetches maxResults', async () => {
    const client = new Web3Storage({ token, endpoint })
    const uploads = []
    const maxResults = 10
    for await (const item of client.list({ maxResults })) {
      uploads.push(item)
    }
    assert.is(uploads.length, maxResults)
    assert.equal(uploads[0], { name: 'web3-storage-web3.storage-205-0bb68d74', cid: 'bafybeie4aoxk72buraibbf2o4f4gfa3pvvb45ay2zlhtlkzgqguj2ubv4e', created: '2021-07-28T10:43:26.055922Z', dagSize: 2398655, pins: [], deals: [] })
    assert.equal(uploads[uploads.length - 1], { name: 'web3-storage-web3.storage-196-81a71c3e', cid: 'bafybeiazmvevppddcab2arm4yq76fvq72xsqrqljphneftsklafpv56rlq', created: '2021-07-27T17:25:55.320939Z', dagSize: 2353102, pins: [{ status: 'Pinned' }, { status: 'Pinned' }, { status: 'Pinned' }, { status: 'Pinned' }, { status: 'Pinned' }, { status: 'Pinned' }], deals: [] })
  })

  it('fetches maxResults > 100', async () => {
    const client = new Web3Storage({ token, endpoint })
    const uploads = []
    const maxResults = 101
    for await (const item of client.list({ maxResults })) {
      uploads.push(item)
    }
    assert.is(uploads.length, 101)
    assert.equal(uploads[0], { name: 'web3-storage-web3.storage-205-0bb68d74', cid: 'bafybeie4aoxk72buraibbf2o4f4gfa3pvvb45ay2zlhtlkzgqguj2ubv4e', created: '2021-07-28T10:43:26.055922Z', dagSize: 2398655, pins: [], deals: [] })
    assert.equal(uploads[uploads.length - 1], { name: 'testing add-to-web3', cid: 'bafybeig2girrvm6wjis6xuqaqvoxhfejuk2bwv4bfzpjhlahsume26ufjy', created: '2021-07-19T23:04:41.935890Z', dagSize: 119879, pins: [], deals: [] })
  })

  it('fetches maxResults > total results', async () => {
    const client = new Web3Storage({ token, endpoint })
    const uploads = []
    const maxResults = 110
    for await (const item of client.list({ maxResults })) {
      uploads.push(item)
    }
    assert.is(uploads.length, 102)
    assert.equal(uploads[0], { name: 'web3-storage-web3.storage-205-0bb68d74', cid: 'bafybeie4aoxk72buraibbf2o4f4gfa3pvvb45ay2zlhtlkzgqguj2ubv4e', created: '2021-07-28T10:43:26.055922Z', dagSize: 2398655, pins: [], deals: [] })
    assert.equal(uploads[uploads.length - 1], { name: 'not-distributed.jpg', cid: 'bafybeig3zgiasqh7bsmvc5cudkkeeh3qborbscua3eqqky7m7fbzgrb4qu', created: '2021-07-14T19:16:55.233593Z', dagSize: null, pins: [], deals: [] })
  })

  it('throws on error', async () => {
    const client = new Web3Storage({ token: 'error', endpoint })
    const uploads = []
    try {
      for await (const item of client.list()) {
        uploads.push(item)
      }
      assert.unreachable('should have thrown')
    } catch (err) {
      console.log(err)
      assert.ok(true)
    }
  })
})
