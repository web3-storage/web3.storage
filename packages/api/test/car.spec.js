/* eslint-env mocha */
import assert from 'assert'
import { CID } from 'multiformats/cid'
import { sha256, sha512 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import { CarWriter } from '@ipld/car'
import fetch, { Blob } from '@web-std/fetch'
import { Cluster } from '@nftstorage/ipfs-cluster'
import retry from 'p-retry'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { concat, equals } from 'uint8arrays'
import { endpoint, clusterApi, clusterApiAuthHeader } from './scripts/constants.js'
import { createCar } from './scripts/car.js'
import { MAX_BLOCK_SIZE } from '../src/constants.js'
import { getTestJWT } from './scripts/helpers.js'
import { PIN_OK_STATUS } from '../src/utils/pin.js'
import {
  S3_BUCKET_ENDPOINT,
  S3_BUCKET_REGION,
  S3_BUCKET_NAME,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY_ID
} from './scripts/worker-globals.js'

// Cluster client needs global fetch
Object.assign(global, { fetch })

describe('POST /car', () => {
  it('should eventually add posted CARs to Cluster', async function () {
    this.timeout(10000)
    const name = 'car'
    // Create token
    const token = await getTestJWT('test-upload', 'test-upload')

    // Create Car
    const { root, car: carBody } = await createCar('hello world!')

    // expected CID for the above data
    const expectedCid = 'bafkreidvbhs33ighmljlvr7zbv2ywwzcmp5adtf4kqvlly67cy56bdtmve'
    assert.strictEqual(root.toString(), expectedCid, 'car file has correct root')

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car',
        'X-Name': name
      },
      body: carBody
    })

    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const { cid } = await res.json()
    assert(cid, 'Server response payload has `cid` property')
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')

    const pinInfo = await retry(async () => {
      const statusRes = await fetch(new URL(`status/${cid}`, endpoint))
      const status = await statusRes.json()
      const pinInfo = status.pins.find(pin => PIN_OK_STATUS.includes(pin.status))
      assert(pinInfo, `status is one of ${PIN_OK_STATUS}`)
      return pinInfo
    }, { retries: 3 })

    const cluster = new Cluster(clusterApi, {
      headers: {
        Authorization: clusterApiAuthHeader
      }
    })
    const clusterPeers = await cluster.peerList()
    // assert that peerId from the status belongs to one of the cluster ipfs nodes.
    assert(clusterPeers.some(peer => peer.ipfs.id === pinInfo.peerId))
  })

  it('should add posted CARs to S3', async () => {
    const token = await getTestJWT('test-upload', 'test-upload')
    const { root, car: carBody } = await createCar('hello world! s3')
    const expectedCid = root.toString()

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: carBody
    })

    const { cid } = await res.json()
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')

    const s3 = new S3Client({
      endpoint: S3_BUCKET_ENDPOINT,
      forcePathStyle: true,
      region: S3_BUCKET_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY_ID
      }
    })

    const listRes = await s3.send(new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME
    }))
    assert.strictEqual(listRes.Contents.length, 1, '1 item uploaded')

    const getRes = await s3.send(new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: listRes.Contents[0].Key
    }))

    const chunks = []
    for await (const chunk of getRes.Body) {
      chunks.push(chunk)
    }
    assert.ok(
      equals(
        concat(chunks),
        new Uint8Array(await carBody.arrayBuffer())
      ),
      'stored CAR is the same as uploaded CAR'
    )
  })

  it('should throw for blocks bigger than the maximum permitted size', async () => {
    const token = await getTestJWT('test-upload', 'test-upload')

    const bytes = pb.encode({ Data: new Uint8Array(MAX_BLOCK_SIZE + 1).fill(1), Links: [] })
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, pb.code, hash)

    const { writer, out } = CarWriter.create(cid)
    writer.put({ cid, bytes })
    writer.close()

    const carBytes = []
    for await (const chunk of out) {
      carBytes.push(chunk)
    }

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.ok(message.includes('block too big'))
  })

  it('should throw for empty CAR', async () => {
    const token = await getTestJWT('test-upload', 'test-upload')

    const bytes = pb.encode({ Data: new Uint8Array(), Links: [] })
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, pb.code, hash)

    const { writer, out } = CarWriter.create(cid)
    writer.close()

    const carBytes = []
    for await (const chunk of out) {
      carBytes.push(chunk)
    }

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.strictEqual(message, 'Invalid CAR file received: empty CAR')
  })

  it('should throw for CAR with no roots', async () => {
    const token = await getTestJWT('test-upload', 'test-upload')

    const bytes = pb.encode({ Data: new Uint8Array(), Links: [] })
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, pb.code, hash)

    const { writer, out } = CarWriter.create([])
    writer.put({ cid, bytes })
    writer.close()

    const carBytes = []
    for await (const chunk of out) {
      carBytes.push(chunk)
    }

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.strictEqual(message, 'Invalid CAR file received: missing roots')
  })

  it('should throw for CAR with multiple roots', async () => {
    const token = await getTestJWT('test-upload', 'test-upload')

    const bytes = pb.encode({ Data: new Uint8Array(), Links: [] })
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, pb.code, hash)

    const { writer, out } = CarWriter.create([
      cid,
      CID.parse('bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e')
    ])
    writer.put({ cid, bytes })
    writer.close()

    const carBytes = []
    for await (const chunk of out) {
      carBytes.push(chunk)
    }

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.strictEqual(message, 'Invalid CAR file received: too many roots')
  })

  it('should throw for CAR with one root block that has links', async () => {
    const token = await getTestJWT('test-upload', 'test-upload')

    const bytes = pb.encode({
      Data: new Uint8Array(),
      Links: [{ Hash: CID.parse('bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e') }]
    })
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, pb.code, hash)

    const { writer, out } = CarWriter.create(cid)
    writer.put({ cid, bytes })
    writer.close()

    const carBytes = []
    for await (const chunk of out) {
      carBytes.push(chunk)
    }

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.strictEqual(message, 'Invalid CAR file received: CAR must contain at least one non-root block')
  })

  it('should allow a CAR with unsupported hash function', async () => {
    const token = await getTestJWT('test-upload', 'test-upload')

    const bytes = pb.encode({ Data: new Uint8Array(), Links: [] })
    // we dont support sha512 yet!
    const hash = await sha512.digest(bytes)
    const cid = CID.create(1, pb.code, hash)

    const { writer, out } = CarWriter.create([cid])
    writer.put({ cid, bytes })
    writer.close()

    const carBytes = []
    for await (const chunk of out) {
      carBytes.push(chunk)
    }

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: new Blob(carBytes)
    })

    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const resBody = await res.json()
    assert(resBody.cid, 'Server response payload has `cid` property')
    assert.strictEqual(resBody.cid, cid.toString(), 'Server responded with expected CID')
  })

  it('should throw for CAR with a block where the bytes do not match the CID', async () => {
    const token = await getTestJWT('test-upload', 'test-upload')

    const bytes = pb.encode({ Data: new Uint8Array(), Links: [] })
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, pb.code, hash)

    const { writer, out } = CarWriter.create([cid])
    bytes[bytes.length - 1] = bytes[bytes.length - 1] + 1 // mangle a byte
    writer.put({ cid, bytes })
    writer.close()

    const carBytes = []
    for await (const chunk of out) {
      carBytes.push(chunk)
    }

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.strictEqual(message, `Invalid CAR file received: block data does not match CID for ${cid.toString()}`)
  })
})
