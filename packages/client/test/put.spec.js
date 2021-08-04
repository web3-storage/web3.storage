/* eslint-env mocha */
import * as assert from 'uvu/assert'
import randomBytes from 'randombytes'
import { Web3Storage } from 'web3.storage'
import { File } from '../src/platform.js'
import { Readable, PassThrough } from 'stream'
import { CarReader, CarWriter } from '@ipld/car'
import * as raw from 'multiformats/codecs/raw'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'

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

  it('errors without content', async () => {
    const client = new Web3Storage({ endpoint, token })
    try {
      await client.put([])
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /missing input file/)
    }
  })

  it('errors with a file that will not be parsed by the Cluster', async function () {
    const client = new Web3Storage({ token, endpoint })
    try {
      await client.put([new File(['test-put-fail'], 'file.txt')], { maxRetries: 1 })
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /Request body not a valid CAR file/)
    }
  })

  it('errors with a received CID that is not the same as generated in the client', async function () {
    const client = new Web3Storage({ token, endpoint })
    try {
      await client.put([new File(['test-compromised-service'], 'file.txt')], { maxRetries: 1 })
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /root CID mismatch/)
    }
  })

  it('adds files', async () => {
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

  it('adds files {wrapWithDirectory: false}', async () => {
    const client = new Web3Storage({ token, endpoint })
    const files = prepareFiles()
    const expectedCid = 'bafybeifkc773a2s6gerq7ip7tikahlfflxe4fvagyxf74zfkr33j2yu5li'
    const cid = await client.put(files, {
      wrapWithDirectory: false,
      name: 'web3-storage-dir-no-wrap',
      onRootCidReady: (cid) => {
        assert.equal(cid, expectedCid, 'returned cid matches the CAR')
      }
    })
    assert.equal(cid, expectedCid, 'returned cid matches the CAR')
  })

  it('adds big files', async function () {
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

describe('putCar', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('adds CAR files', async () => {
    const client = new Web3Storage({ token, endpoint })
    const car = await prepareCarFile()
    const expectedCid = 'bafybeiep3t2chy6e3dxk3fktnshm7tpopjrns6wevo4uwpnnz5aq352se4'
    const cid = await client.putCar(car, {
      name: 'web3-storage-dir',
      onRootCidReady: (cid) => {
        assert.equal(cid, expectedCid, 'returned cid matches the CAR')
      }
    })
    assert.equal(cid, expectedCid, 'returned cid matches the CAR')
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

async function prepareCarFile () {
  const bytes = new TextEncoder().encode('random meaningless bytes')
  const hash = await sha256.digest(raw.encode(bytes))
  const cid = CID.create(1, raw.code, hash)

  // create the writer and set the header with a single root
  const { writer, out } = await CarWriter.create([cid])
  const pass = new PassThrough()
  Readable.from(out).pipe(pass)

  // store a new block, creates a new file entry in the CAR archive
  await writer.put({ cid, bytes })
  await writer.close()

  // read and parse the entire stream in one go, this will cache the contents of
  // the car in memory so is not suitable for large files.
  const reader = await CarReader.fromIterable(pass)
  return reader
}
