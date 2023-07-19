/* eslint-env mocha */
import * as assert from 'uvu/assert'
import randomBytes from 'randombytes'
import { Web3Storage } from 'web3.storage'
import { File } from '../src/platform.js'
import { createUnboundRateLimiter } from './utils.js'
import { pack } from 'ipfs-car/pack'
import { CarReader, CarWriter } from '@ipld/car'
import { CID } from 'multiformats/cid'
import { encode } from 'multiformats/block'
import * as json from '@ipld/dag-json'
import { sha256 } from 'multiformats/hashes/sha2'
import { ReadableStream } from '@web-std/blob'

describe('put', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://127.0.0.1:${API_PORT}` : '')

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

  it('errors with wrong max chunk size', async () => {
    const client = new Web3Storage({ endpoint, token })
    try {
      await client.put([], { maxChunkSize: 10 })
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /maximum chunk size must be less than 100MiB and greater than or equal to 1MB/)
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

  it('adds files {maxChunkSize: custom-size}', async () => {
    const client = new Web3Storage({ token, endpoint })
    const files = prepareFiles()
    const expectedCid = 'bafybeiep3t2chy6e3dxk3fktnshm7tpopjrns6wevo4uwpnnz5aq352se4'
    const cid = await client.put(files, {
      name: 'web3-storage-dir-with-custom-max-chunk-size',
      maxChunkSize: 1024 * 1024 * 5,
      onRootCidReady: (cid) => {
        assert.equal(cid, expectedCid, 'returned cid matches the CAR')
      }
    })
    assert.equal(cid, expectedCid, 'returned cid matches the CAR')
  })

  it('adds big files', async function () {
    this.timeout(120e3)
    const rateLimiter = createUnboundRateLimiter()
    const client = new Web3Storage({ token, endpoint, rateLimiter })
    let uploadedChunks = 0

    const files = [
      // Previously: new File([randomBytes(1024e6)], '102mb.txt')
      //
      // Node.js currently copies the buffer on every iteration when obtaining a
      // stream from File.stream(). It also has a fixed and small chunk size of
      // 65536 bytes. This makes reading the stream VERY slow and this test
      // fails because it times out.
      //
      // TODO: revert to using File if this issue gets resolved:
      // https://github.com/nodejs/node/issues/42108
      {
        name: '102mb.txt',
        stream () {
          return new ReadableStream({
            pull (controller) {
              controller.enqueue(randomBytes(1024e6))
              controller.close()
            }
          })
        }
      }
    ]

    await client.put(files, {
      onStoredChunk: () => {
        uploadedChunks++
      }
    })
    assert.ok(uploadedChunks >= 20)
  })

  it('aborts', async () => {
    const client = new Web3Storage({ token, endpoint })
    const files = prepareFiles()
    const controller = new AbortController()
    controller.abort()
    try {
      await client.put(files, { signal: controller.signal })
      assert.unreachable('request should not have succeeded')
    } catch (err) {
      assert.equal(err.name, 'AbortError')
    }
  })
})

describe('putCar', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://127.0.0.1:${API_PORT}` : '')

  it('adds CAR files', async () => {
    const client = new Web3Storage({ token, endpoint })
    const carReader = await createCar('hello world')
    const expectedCid = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354'
    const cid = await client.putCar(carReader, {
      name: 'putCar test',
      onRootCidReady: cid => {
        assert.equal(cid, expectedCid, 'returned cid matches the CAR')
      }
    })
    assert.equal(cid, expectedCid, 'returned cid matches the CAR')
  })

  it('adds CAR files {maxChunkSize: custom-size}', async () => {
    const client = new Web3Storage({ token, endpoint })
    const carReader = await createCar('hello world')
    const expectedCid = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354'
    const cid = await client.putCar(carReader, {
      name: 'putCar test',
      maxChunkSize: 1024 * 1024 * 5,
      onRootCidReady: cid => {
        assert.equal(cid, expectedCid, 'returned cid matches the CAR')
      }
    })
    assert.equal(cid, expectedCid, 'returned cid matches the CAR')
  })

  it('errors for CAR with zero roots', async () => {
    const client = new Web3Storage({ token, endpoint })
    const { writer, out } = CarWriter.create([])
    writer.close()
    const reader = await CarReader.fromIterable(out)
    try {
      await client.putCar(reader)
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /missing root CID/)
    }
  })

  it('errors for CAR with multiple roots', async () => {
    const client = new Web3Storage({ token, endpoint })
    const { writer, out } = CarWriter.create([
      CID.parse('bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354'),
      CID.parse('bafybeifkc773a2s6gerq7ip7tikahlfflxe4fvagyxf74zfkr33j2yu5li')
    ])
    writer.close()
    const reader = await CarReader.fromIterable(out)
    try {
      await client.putCar(reader)
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /too many roots/)
    }
  })

  it('errors for CAR with wrong max chunk size', async () => {
    const client = new Web3Storage({ token, endpoint })
    const carReader = await createCar('hello world')
    try {
      await client.putCar(carReader, { maxChunkSize: 10 })
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /maximum chunk size must be less than 100MiB and greater than or equal to 1MB/)
    }
  })

  it('put CAR with non-default decoder', async () => {
    const client = new Web3Storage({ token, endpoint })
    const block = await encode({ value: { hello: 'world' }, codec: json, hasher: sha256 })
    const { writer, out } = CarWriter.create([block.cid])
    writer.put(block)
    writer.close()
    const reader = await CarReader.fromIterable(out)
    const cid = await client.putCar(reader, {
      name: 'putCar test',
      onRootCidReady: cid => {
        assert.equal(cid, block.cid.toString(), 'returned cid matches the CAR')
      },
      decoders: [json]
    })
    assert.equal(cid, block.cid.toString(), 'returned cid matches the CAR')
  })

  it('encodes filename for header', async () => {
    const client = new Web3Storage({ token, endpoint })
    const carReader = await createCar('hello world')
    const expectedCid = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354'
    const cid = await client.putCar(carReader, {
      name: 'filename–with–funky–chars',
      onRootCidReady: cid => {
        assert.equal(cid, expectedCid, 'returned cid matches the CAR')
      }
    })
    assert.equal(cid, expectedCid, 'returned cid matches the CAR')
  })

  it('throws network error', async () => {
    const fetch = () => { throw new Error('network error') }
    const client = new Web3Storage({ token, endpoint, fetch })
    // creates special CAR with CID that causes the server to error:
    // bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354
    const carReader = await createCar('server error')
    try {
      await client.putCar(carReader, { maxRetries: 0 })
      assert.unreachable('request should not have succeeded')
    } catch (err) {
      assert.match(err.message, /network error/)
    }
  })

  it('aborts', async () => {
    const client = new Web3Storage({ token, endpoint })
    const carReader = await createCar('hello world')
    const controller = new AbortController()
    controller.abort()
    try {
      await client.putCar(carReader, { signal: controller.signal })
      assert.unreachable('request should not have succeeded')
    } catch (err) {
      assert.equal(err.name, 'AbortError')
    }
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

// creates a carReader from a text string
async function createCar (str) {
  const { out } = await pack({ input: new TextEncoder().encode(str) })
  const reader = await CarReader.fromIterable(out)
  return reader
}
