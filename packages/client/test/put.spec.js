/* eslint-env mocha */
import * as assert from 'uvu/assert'
import randomBytes from 'randombytes'
import { Web3Storage } from 'web3.storage'
import { File } from '../src/platform.js'
import { PassThrough } from 'stream'
import * as raw from 'multiformats/codecs/raw'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { packToBlob } from 'ipfs-car/pack/blob'
import { CarReader } from '@ipld/car'

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
    const carReader = await createCar('hello world')
    console.log('created car in test')
    const expectedCid = 'bafkreihwkf6mtnjobdqrkiksr7qhp6tiiqywux64aylunbvmfhzeql2coa'
    const cid = await client.putCar(carReader, {
      name: 'putCar test',
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

// creates a carReader from a text string
async function createCar (str) {
  console.log('str is: ', str)
  const carBlob = await packToBlob({
    input: new TextEncoder().encode(str)
  })
  console.log('carBlob is type: ', typeof car) // object
  console.log('carBlob is: ', carBlob)
  // this root CID doesn't change no matter what string is passed into createCar,
  // which seems problematic
  // {
  // root: CID(bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354),
  // car: Blob {}
  // }
  console.log('type of carBlob is: ', typeof carBlob.car) // object
  console.log('carBlob.root is: ', carBlob.root) // CID(bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354)
  const buffer = await carBlob.car.arrayBuffer()
  console.log(typeof buffer) // object
  console.log(buffer)
  // ArrayBuffer {
  //   [Uint8Contents]: <3a a2 65 72 6f 6f 74 73 81 d8 2a 58 25 00 01 70 12 20 59 94 84 39 06 5f 29 61 9e f4 12 80 cb b9 32 be 52 c5 6d 99 c5 96 6b 65 e0 11 12 39 f0 98 bb ef 67 76 65 72 73 69 6f 6e 01>,
  //   byteLength: 59
  // }
  console.log(buffer.Uint8Contents) // undefined

  const reader = await CarReader.fromBytes(carBlob)
  // FAILS HERE with "fromBytes() requires a Uint8Array"
  // regardless of whether I pass carBlob or carBlob.car or buffer
  console.log('reader is: ', reader)
  return reader
}
