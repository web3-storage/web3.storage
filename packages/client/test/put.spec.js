/* eslint-env mocha */
import * as assert from 'uvu/assert'
import randomBytes from 'randombytes'
import { Web3Storage } from 'web3.storage'
import { File } from '../src/platform.js'

describe('put', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('errors without token', async () => {
    // @ts-ignore
    const client = new Web3Storage({ endpoint })
    const files = prepareFiles()
    try {
      await client.put(files)
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.is(err.message, 'missing token')
    }
  })

  it.skip('errors without content', async () => {
    const client = new Web3Storage({ endpoint, token })
    try {
      await client.put([])
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /input could not be parsed correctly/)
    }
  })

  it('erros with a File that will not be parsed by the Cluster', async function () {
    const client = new Web3Storage({ token, endpoint })
    try {
      await client.put([new File(['test-put-fail'], 'file.txt')], { maxRetries: 1 })
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /Request body not a valid CAR file/)
    }
  })

  it('adds Files', async () => {
    const client = new Web3Storage({ token, endpoint })
    const files = prepareFiles()
    const expectedCid = 'bafybeiep3t2chy6e3dxk3fktnshm7tpopjrns6wevo4uwpnnz5aq352se4'
    const cid = await client.put(files, {
      name: 'web3-storage-dir',
      onRootCidReady: (cid) => {
        assert.equal(cid, expectedCid, 'returned cid matches the CAR')
      }
    })
    assert.equal(cid, expectedCid, 'returned cid matches the CAR')
  })

  it('adds Big Files', async function () {
    this.timeout(30e3)
    const client = new Web3Storage({ token, endpoint })
    let uploadedChunks = 0

    const files = [
      new File([randomBytes(1024e6)], '102mb.txt')
    ]

    await client.put(files, {
      onStoredChunk: () => {
        uploadedChunks++
      }
    })
    assert.ok(uploadedChunks >= 100)
  })
})

function prepareFiles () {
  const data = 'Hello web3.storage!'
  const data2 = 'Hello web3.storage!!'

  return [
    new File(
      [data],
      '/dir/data.txt'
    ),
    new File(
      [data2],
      '/dir/data2.txt'
    ),
    new File(
      [data],
      '/dir/otherdir/data.txt'
    ),
    new File(
      [data2],
      '/dir/otherdir/data2.txt'
    )
  ]
}
