/* eslint-env mocha */
import assert from 'assert'
import { CID } from 'multiformats/cid'
import { sha256, sha512 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import { CarWriter } from '@ipld/car'
import fetch, { Blob } from '@web-std/fetch'
import { endpoint, clusterApi, clusterApiAuthHeader } from './scripts/constants.js'
import { createCar } from './scripts/car.js'
import { MAX_BLOCK_SIZE } from '../src/constants.js'
import { getTestJWT } from './scripts/helpers.js'
import { PIN_OK_STATUS } from '../src/utils/pin.js'

describe('POST /car', () => {
  it('should add posted CARs to Cluster', async () => {
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

    const statusRes = await fetch(new URL(`status/${cid}`, endpoint))
    const status = await statusRes.json()
    const pinInfo = status.pins.find(pin => PIN_OK_STATUS.includes(pin.status))
    assert(pinInfo, `status is one of ${PIN_OK_STATUS}`)

    const clusterPeersRes = await fetch(new URL('peers', clusterApi), {
      headers: {
        Authorization: clusterApiAuthHeader
      }
    })
    const clusterPeers = await clusterPeersRes.json()
    // assert that peerId from the status belongs to one of the cluster ipfs nodes.
    assert(clusterPeers.some(peer => peer.ipfs.id === pinInfo.peerId))
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

  it('should throw for CAR with a block where the bytes do match the CID', async () => {
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
