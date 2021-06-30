import * as assert from 'uvu/assert'
import { FilecoinStorage, Blob } from 'web3.storage'
import { pack } from 'ipfs-car/pack'

describe('store', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

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

  it('errors with not a CAR', async () => {
    const client = new FilecoinStorage({ endpoint, token })
    try {
      await client.store(new Blob(['hello']))
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.is(err.message, 'Request body not a valid CAR file')
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
})

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
