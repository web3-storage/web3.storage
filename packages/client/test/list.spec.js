/* eslint-env mocha */
import * as assert from 'uvu/assert'
import { Web3Storage } from 'web3.storage'

describe.only('list', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('fetches all uploads for account', async () => {
    const client = new Web3Storage({ token, endpoint })
    const uploads = []
    for await (const item of client.list()) {
      uploads.push(item)
    }
    assert.is(uploads.length, 101)
    assert.equal(uploads[0], { name: 'web3-storage-web3.storage-205-0bb68d74', cid: 'bafybeie4aoxk72buraibbf2o4f4gfa3pvvb45ay2zlhtlkzgqguj2ubv4e', created: '2021-07-28T10:43:26.055922Z', dagSize: 2398655, pins: [], deals: [] })
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
  })

  it('fetches maxResults > 100', async () => {
    const client = new Web3Storage({ token, endpoint })
    const uploads = []
    const maxResults = 110
    for await (const item of client.list({ maxResults })) {
      uploads.push(item)
    }
    assert.is(uploads.length, 101)
    assert.equal(uploads[0], { name: 'web3-storage-web3.storage-205-0bb68d74', cid: 'bafybeie4aoxk72buraibbf2o4f4gfa3pvvb45ay2zlhtlkzgqguj2ubv4e', created: '2021-07-28T10:43:26.055922Z', dagSize: 2398655, pins: [], deals: [] })
  })
})
