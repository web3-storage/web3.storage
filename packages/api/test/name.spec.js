/* eslint-env mocha, browser */
import assert from 'assert'
import * as uint8arrays from 'uint8arrays'
import { endpoint } from './scripts/constants.js'
import { createNameKeypair, createNameRecord, getTestJWT } from './scripts/helpers.js'

describe('GET /name/:key', () => {
  it('resolves key to value', async () => {
    const key = 'k51qzi5uqu5dl2hq2hm5m29sdq1lum0kb0lmyqsowicmrmxzxywwgxhy6ymrdv'
    const res = await fetch(new URL(`name/${key}`, endpoint))
    assert(res.ok)
    const { value, record } = await res.json()
    assert.strictEqual(value, '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui')
    assert.strictEqual(record, 'CkEvaXBmcy9iYWZrcmVpZW00dHdrcXpzcTJhajRzaGJ5Y2Q0eXZvajJjeDcydmV6aWNsZXRsaGk3ZGlqamNpcXB1aRJAiThIzmqigDqiV4p4tJ31wiWuMy4gWAuZaPdGzXdIOm+SYfJ/JlDNUAXILZO7vh0mkHdFYLeHouHZFMQI2dqrARgAIh4yMDIxLTExLTE2VDIyOjQ2OjA4Ljg5NjAwMDAwMFooADCAoLCNvQpCQLiFTWU8F+O8R/V+ql5glmnaBEh8+bBKZ6o1s84+TGeVlzqRn/2XstFYV83ilEHseU4bvHfxwaxLoucJaMYeNQVKmAGlY1RUTBsAAABT0awQAGVWYWx1ZVhBL2lwZnMvYmFma3JlaWVtNHR3a3F6c3EyYWo0c2hieWNkNHl2b2oyY3g3MnZlemljbGV0bGhpN2RpampjaXFwdWloU2VxdWVuY2UAaFZhbGlkaXR5WB4yMDIxLTExLTE2VDIyOjQ2OjA4Ljg5NjAwMDAwMFpsVmFsaWRpdHlUeXBlAA==')
  })
})

describe('POST /name/:key', () => {
  it('publishes value for key', async () => {
    const token = await getTestJWT()
    const { id: key, privateKey } = await createNameKeypair()
    const value = '/ipfs/bafybeiauyddeo2axgargy56kwxirquxaxso3nobtjtjvoqu552oqciudrm'
    const record = await createNameRecord(privateKey, value)
    const publishRes = await fetch(new URL(`name/${key}`, endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: uint8arrays.toString(record, 'base64pad')
    })
    assert(publishRes.ok)
    const { id } = await publishRes.json()
    assert.strictEqual(id, key)

    const resolveRes = await fetch(new URL(`name/${key}`, endpoint))
    assert(resolveRes.ok)
    const resolved = await resolveRes.json()
    assert.strictEqual(resolved.record, uint8arrays.toString(record, 'base64pad'))
    assert.strictEqual(resolved.value, value)
  })
})
