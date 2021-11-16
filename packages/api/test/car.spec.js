/* eslint-env mocha, browser */
import assert from 'assert'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import { CarWriter } from '@ipld/car'
import { endpoint } from './scripts/constants.js'
import { createCar } from './scripts/car.js'
import { MAX_BLOCK_SIZE } from '../src/constants.js'
import { getTestJWT } from './scripts/helpers.js'

describe('POST /car', () => {
  it('should add posted CARs to Cluster', async () => {
    const name = 'car'
    // Create token
    const token = await getTestJWT()

    // Create Car
    const { root, car: carBody } = await createCar('hello world!')

    // expected CID for the above data
    const expectedCid = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354'
    assert.strictEqual(root.toString(), expectedCid, 'car file has correct root')

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/car',
        'X-Name': name
      },
      body: carBody
    })

    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const { cid } = await res.json()
    assert(cid, 'Server response payload has `cid` property')
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')
  })

  it('should throw for blocks bigger than the maximum permitted size', async () => {
    const token = await getTestJWT()

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
        'Content-Type': 'application/car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.ok(message.includes('block too big'))
  })

  it('should throw for empty CAR', async () => {
    const token = await getTestJWT()

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
        'Content-Type': 'application/car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.strictEqual(message, 'empty CAR')
  })

  it('should throw for CAR with no roots', async () => {
    const token = await getTestJWT()

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
        'Content-Type': 'application/car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.strictEqual(message, 'missing roots')
  })

  it('should throw for CAR with multiple roots', async () => {
    const token = await getTestJWT()

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
        'Content-Type': 'application/car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.strictEqual(message, 'too many roots')
  })

  it('should throw for CAR with one root block that has links', async () => {
    const token = await getTestJWT()

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
        'Content-Type': 'application/car'
      },
      body: new Blob(carBytes)
    })

    assert.strictEqual(res.ok, false)
    const { message } = await res.json()
    assert.strictEqual(message, 'CAR must contain at least one non-root block')
  })
})
