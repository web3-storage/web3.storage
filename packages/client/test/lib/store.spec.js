import { CarReader } from '@ipld/car'
import * as assert from 'uvu/assert'
import { FilecoinStorage, Blob } from 'filecoin.storage'
import { CID } from 'multiformats'
import { pack } from 'ipfs-car/pack'
import { CarWriter } from '@ipld/car'
import * as dagCbor from '@ipld/dag-cbor'
import { garbage } from 'ipld-garbage'
import { sha256 } from 'multiformats/hashes/sha2'

const DWEB_LINK = 'dweb.link'

describe('store', () => {
  const { AUTH_TOKEN, SERVICE_ENDPOINT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(SERVICE_ENDPOINT || '')

  it('errors without token', async () => {
    // @ts-ignore
    const client = new FilecoinStorage({ endpoint })
    const { car } = await createCarBlobFromString('hello')
    try {
      await client.store(car)
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.is(err.message, 'missing token')
    }
  })

  it('errors without content', async () => {
    const client = new FilecoinStorage({ endpoint, token })
    try {
      await client.store(new Blob([]))
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /provide some content/)
    }
  })

  it('uploads a CAR', async () => {
    const client = new FilecoinStorage({ token, endpoint })
    const { car, root } = await createCarBlobFromString('hello')
    const cid = await client.store(car)
    assert.equal(cid, root.toString(), 'returned cid matches the CAR root')
  })

  it('upload CAR with a blob lacking blob.type', async () => {
    const client = new FilecoinStorage({ token, endpoint })
    const { root, out } = await pack({
      input: [new TextEncoder().encode('hello world')],
    })
    const expectedCid = root.toString()
    const carParts = []
    for await (const part of out) {
      carParts.push(part)
    }
    const car = new Blob(carParts)
    const cid = await client.store(car)
    assert.equal(cid, expectedCid)
  })

  it('upload CAR with a CarReader', async () => {
    const client = new FilecoinStorage({ token, endpoint })
    const { root, out } = await pack({
      input: [new TextEncoder().encode('hello world')],
    })
    const expectedCid = root.toString()

    const carReader = await CarReader.fromIterable(out)

    const cid = await client.storeCar(carReader)
    assert.equal(cid, expectedCid)
  })

  it('upload large CAR with a CarReader', async function () {
    this.timeout(130e3)
    let uploadedChunks = 0

    const client = new FilecoinStorage({ token, endpoint })

    const targetSize = 1024 * 1024 * 120 // ~120MB CARs
    const carReader = await CarReader.fromIterable(await randomCar(targetSize))

    const roots = await carReader.getRoots()
    const expectedCid = roots[0]?.toString()

    const cid = await client.storeCar(carReader, {
      onStoredChunk: () => {
        uploadedChunks++
      },
    })
    assert.ok(uploadedChunks >= 12)
    assert.equal(cid, expectedCid)
  })
})

const MAX_BLOCK_SIZE = 1024 * 1024 * 4

function randomBlockSize() {
  const max = MAX_BLOCK_SIZE
  const min = max / 2
  return Math.random() * (max - min) + min
}

/**
 * @param {number} targetSize
 * @returns {Promise<AsyncIterable<Uint8Array>>}
 */
async function randomCar(targetSize) {
  const blocks = []
  let size = 0
  const seen = new Set()
  while (size < targetSize) {
    const bytes = dagCbor.encode(
      garbage(randomBlockSize(), { weights: { CID: 0 } })
    )
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, dagCbor.code, hash)
    if (seen.has(cid.toString())) continue
    seen.add(cid.toString())
    blocks.push({ cid, bytes })
    size += bytes.length
  }
  const rootBytes = dagCbor.encode(blocks.map((b) => b.cid))
  const rootHash = await sha256.digest(rootBytes)
  const rootCid = CID.create(1, dagCbor.code, rootHash)
  const { writer, out } = CarWriter.create([rootCid])
  writer.put({ cid: rootCid, bytes: rootBytes })
  blocks.forEach((b) => writer.put(b))
  writer.close()
  return out
}

async function createCarBlobFromString(str) {
  const { root, out } = await pack({
    input: [new TextEncoder().encode(str)],
  })
  const carParts = []
  for await (const part of out) {
    carParts.push(part)
  }
  const car = new Blob(carParts, { type: 'application/car' })
  return { root, car }
}
