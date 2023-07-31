/* eslint-env mocha */
import assert from 'assert'
import { CID } from 'multiformats/cid'
import * as Block from 'multiformats/block'
import { sha256, sha512 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import { CarWriter } from '@ipld/car'
import fetch, { Blob } from '@web-std/fetch'
import { Cluster } from '@nftstorage/ipfs-cluster'
import retry from 'p-retry'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { concat, equals } from 'uint8arrays'
import { MultihashIndexSortedReader } from 'cardex'
import * as Claims from '@web3-storage/content-claims/client'
import { Assert } from '@web3-storage/content-claims/capability'
import { endpoint, clusterApi, clusterApiAuthHeader } from './scripts/constants.js'
import { createCar } from './scripts/car.js'
import { MAX_BLOCK_SIZE, CAR_CODE } from '../src/constants.js'
import { getTestJWT, getDBClient } from './scripts/helpers.js'
import { PIN_OK_STATUS } from '../src/utils/pin.js'
import * as CAR from '../src/utils/car.js'
import {
  S3_BUCKET_ENDPOINT,
  S3_BUCKET_REGION,
  S3_BUCKET_NAME,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY_ID,
  LINKDEX_URL,
  CARPARK_URL
} from './scripts/worker-globals.js'

// Cluster client needs global fetch
Object.assign(global, { fetch })

describe('POST /car', () => {
  // FIXME: add to cluster failing with "multipart: NextPart: EOF"
  // Code that is tested is not run in production...
  it.skip('should eventually add posted CARs to Cluster', async function () {
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

    const cluster = new Cluster(clusterApi, {
      headers: {
        Authorization: clusterApiAuthHeader
      }
    })

    const clusterPeers = await cluster.peerList()

    await retry(async () => {
      const statusRes = await fetch(new URL(`status/${cid}`, endpoint))
      const status = await statusRes.json()
      const pinInfo = status.pins.find(pin =>
        PIN_OK_STATUS.includes(pin.status) &&
        clusterPeers.some(peer => peer.ipfs.id === pin.peerId)
      )
      assert(pinInfo, `status is one of ${PIN_OK_STATUS}`)
    }, { retries: 3 })
  })

  it('should add posted CARs to S3 and R2', async () => {
    const issuer = 'test-upload'
    const token = await getTestJWT(issuer, issuer)
    const { root, car: carBody } = await createCar('hello world! s3 & r2')
    const carBytes = new Uint8Array(await carBody.arrayBuffer())
    const expectedCid = root.toString()
    const expectedCarCid = CID.createV1(CAR_CODE, await sha256.digest(carBytes)).toString()

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: carBody
    })
    const { cid, carCid } = await res.json()
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')
    assert.strictEqual(carCid, expectedCarCid, 'Server responded with expected CAR CID')

    /**
     * @param {AsyncIterable} stream
     * @param {Uint8Array} carBytes
     * */
    const assertSameBytes = async (stream, carBytes) => {
      const chunks = []
      // @ts-ignore
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      assert.ok(
        equals(
          concat(chunks),
          carBytes
        ),
        'stored CAR is the same as uploaded CAR'
      )
    }

    /** @type {import('miniflare').Miniflare} */
    const mf = globalThis.miniflare
    const r2Bucket = await mf.getR2Bucket('CARPARK')
    const r2Object = await r2Bucket.get(`${carCid}/${carCid}.car`)
    assert.ok(r2Object?.body, 'repsonse stream must exist')
    await assertSameBytes(r2Object?.body, carBytes)
    assert.strictEqual(r2Object.customMetadata.rootCid, expectedCid, 'r2 object should have rootCid in metadata')
    assert.strictEqual(r2Object.customMetadata.structure, 'Complete', 'r2 object should have structure in metadata')

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
    assert.strictEqual(listRes?.Contents?.length, 1, '1 item uploaded')

    const getRes = await s3.send(new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: listRes.Contents[0].Key
    }))
    assert.ok(getRes.Body, 'repsonse stream must exist')
    // @ts-expect-error
    await assertSameBytes(getRes.Body, carBytes)

    const db = getDBClient()
    const user = await db.getUser(issuer, {})
    assert.ok(user)
    const upload = await db.getUpload(expectedCid, Number(user._id))
    assert.ok(upload)
    const backups = await db.getBackups(Number(upload._id))
    assert.ok(backups)
    assert.equal(backups.length, 2, 'expect 2 backups')
    assert.equal(backups[1], `${CARPARK_URL}/${expectedCarCid}/${expectedCarCid}.car`, 'r2 backup url')
  })

  it('should write satnav index', async () => {
    const issuer = 'test-upload'
    const token = await getTestJWT(issuer, issuer)
    const { root, car: carBody } = await createCar('satnav')
    const carBytes = new Uint8Array(await carBody.arrayBuffer())
    const expectedCid = root.toString()
    const expectedCarCid = CID.createV1(CAR_CODE, await sha256.digest(carBytes)).toString()

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: carBody
    })
    const { cid, carCid } = await res.json()
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')
    assert.strictEqual(carCid, expectedCarCid, 'Server responded with expected CAR CID')

    /** @type {import('miniflare').Miniflare} */
    const mf = globalThis.miniflare
    const r2Bucket = await mf.getR2Bucket('SATNAV')
    const r2Object = await r2Bucket.get(`${carCid}/${carCid}.car.idx`)
    assert.ok(r2Object?.body, 'repsonse stream must exist')

    const reader = MultihashIndexSortedReader.createReader({ reader: r2Object.body.getReader() })
    const entries = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      entries.push(value)
    }

    assert.equal(entries.length, 1, 'Index contains a single entry')
    const entryDigest = entries[0]?.digest
    assert(entryDigest)
    assert.ok(equals(entryDigest, root.multihash.digest), 'Index entry is for root data CID')
  })

  it('should write dudewhere index', async () => {
    const issuer = 'test-upload'
    const token = await getTestJWT(issuer, issuer)
    const { root, car: carBody } = await createCar('dude where\'s my CAR')
    const carBytes = new Uint8Array(await carBody.arrayBuffer())
    const expectedCid = root.toString()
    const expectedCarCid = CID.createV1(CAR_CODE, await sha256.digest(carBytes)).toString()

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: carBody
    })
    const { cid, carCid } = await res.json()
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')
    assert.strictEqual(carCid, expectedCarCid, 'Server responded with expected CAR CID')

    /** @type {import('miniflare').Miniflare} */
    const mf = globalThis.miniflare
    const r2Bucket = await mf.getR2Bucket('DUDEWHERE')
    const r2Objects = await r2Bucket.list({ prefix: `${expectedCid}/` })

    assert.equal(r2Objects.objects.length, 1)
    assert.equal(r2Objects.objects[0].key, `${expectedCid}/${expectedCarCid}`)
  })

  it('should ask linkdex for structure if DAG is not complete', async function () {
    const token = await getTestJWT('test-upload', 'test-upload')
    const leaf1 = await Block.encode({ value: pb.prepare({ Data: 'leaf1' }), codec: pb, hasher: sha256 })
    const leaf2 = await Block.encode({ value: pb.prepare({ Data: 'leaf2' }), codec: pb, hasher: sha256 })
    const parent = await Block.encode({ value: pb.prepare({ Links: [leaf1.cid, leaf2.cid] }), codec: pb, hasher: sha256 })
    const { writer, out } = CarWriter.create(parent.cid)
    writer.put(parent)
    writer.put(leaf1)
    // leave out leaf2 to make patial car
    writer.close()

    const carBytes = []
    for await (const chunk of out) {
      carBytes.push(chunk)
    }

    // Mock the linkdex api
    // https://miniflare.dev/core/standards#mocking-outbound-fetch-requests
    const fetchMock = globalThis.miniflareFetchMock
    const linkdexMock = fetchMock.get(LINKDEX_URL)
    linkdexMock
      .intercept({ path: /^\/\?key=/, method: 'GET' })
      .reply(200, { structure: 'Complete' }, { headers: { 'content-type': 'application/json' } })

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: new Blob(carBytes)
    })

    const { cid } = await res.json()
    assert.strictEqual(cid, parent.cid.toString(), 'Server responded with expected CID')

    // should evetually be marked as pinned on elastic-ipfs as lindex says it's complete
    await retry(async () => {
      const statusRes = await fetch(new URL(`status/${cid}`, endpoint))
      const status = await statusRes.json()
      const pinInfo = status.pins.find(pin => pin.peerName === 'elastic-ipfs')
      assert(pinInfo?.status === 'Pinned', 'status is Pinned for elastic-ipfs')
    }, { retries: 3 })

    linkdexMock.destroy()
  })

  it('should write content claims', async () => {
    const issuer = 'test-upload'
    const token = await getTestJWT(issuer, issuer)
    const leaf = await Block.encode({ value: pb.prepare({ Data: 'leaf1' }), codec: pb, hasher: sha256 })
    const middle = await Block.encode({ value: pb.prepare({ Links: [leaf.cid] }), codec: pb, hasher: sha256 })
    const parent = await Block.encode({ value: pb.prepare({ Links: [middle.cid] }), codec: pb, hasher: sha256 })
    const car = await CAR.encode(parent.cid, [parent, middle, leaf])

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: car.bytes
    })
    await res.json()

    /** @param {import('multiformats').UnknownLink} content */
    const getClaims = async content => {
      /** @type {import('@web3-storage/content-claims/server/api').ClaimStore} */
      const claimStore = globalThis.claimStore
      const rows = await claimStore.get(content)
      const claims = await Promise.all(rows.map(c => Claims.decode(c.bytes)))
      const groups = {
        [Assert.inclusion.can]: /** @type {import('@web3-storage/content-claims/client/api').InclusionClaim[]} */ ([]),
        [Assert.relation.can]: /** @type {import('@web3-storage/content-claims/client/api').RelationClaim[]} */ ([]),
        [Assert.partition.can]: /** @type {import('@web3-storage/content-claims/client/api').PartitionClaim[]} */ ([])
      }
      for (const c of claims) {
        const group = groups[c.type]
        if (!group) throw new Error('unknown claim')
        group.push(c)
      }
      return groups
    }

    let claims = await getClaims(parent.cid)

    // expect a partition claim and relation claim for parent
    assert.equal(claims[Assert.relation.can].length, 1)
    assert.equal(claims[Assert.partition.can].length, 1)
    assert.equal(claims[Assert.inclusion.can].length, 0)

    assert.equal(claims[Assert.relation.can][0].children.length, 1)
    assert.equal(claims[Assert.relation.can][0].children[0].toString(), middle.cid.toString())
    assert.equal(claims[Assert.relation.can][0].parts.length, 1)
    assert.equal(claims[Assert.relation.can][0].parts[0].content.toString(), car.cid.toString())

    const part = claims[Assert.partition.can][0].parts[0]
    assert(part)

    claims = await getClaims(part)

    // expect an inclusion claim for the CAR
    assert.equal(claims[Assert.partition.can].length, 0)
    assert.equal(claims[Assert.inclusion.can].length, 1)
    assert.equal(claims[Assert.relation.can].length, 0)

    const index = claims[Assert.inclusion.can][0].includes
    claims = await getClaims(index)

    // expect a partition claim for the index
    assert.equal(claims[Assert.partition.can].length, 1)
    assert.equal(claims[Assert.inclusion.can].length, 0)
    assert.equal(claims[Assert.relation.can].length, 0)

    const indexPart = claims[Assert.partition.can][0].parts[0]
    assert(indexPart)

    claims = await getClaims(middle.cid)

    // expect a relation claim for the middle node
    assert.equal(claims[Assert.partition.can].length, 0)
    assert.equal(claims[Assert.inclusion.can].length, 0)
    assert.equal(claims[Assert.relation.can].length, 1)

    assert.equal(claims[Assert.relation.can][0].children.length, 1)
    assert.equal(claims[Assert.relation.can][0].children[0].toString(), leaf.cid.toString())
    assert.equal(claims[Assert.relation.can][0].parts[0].content.toString(), car.cid.toString())

    claims = await getClaims(leaf.cid)

    // expect no claims for the leaf
    assert.equal(claims[Assert.partition.can].length, 0)
    assert.equal(claims[Assert.inclusion.can].length, 0)
    assert.equal(claims[Assert.relation.can].length, 0)
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
    assert.strictEqual(message, 'CID hash does not match bytes')
  })
})
