/* eslint-env mocha, browser */
import assert from 'assert'
import * as uint8arrays from 'uint8arrays'
import fetch from '@web-std/fetch'
import websocket from 'websocket'
import defer from 'p-defer'
import { endpoint } from './scripts/constants.js'
import { createNameKeypair, createNameRecord, updateNameRecord, getTestJWT } from './scripts/helpers.js'

const WebSocketClient = websocket.client

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

describe('GET /name/:key/watch', () => {
  it('watches for publishes to a key', async () => {
    const token = await getTestJWT()
    const name0 = await createNameKeypair()
    const name1 = await createNameKeypair()
    const name0Value0 = '/ipfs/bafybeiauyddeo2axgargy56kwxirquxaxso3nobtjtjvoqu552oqciudrm'
    const name0Value1 = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
    const name1Value0 = '/ipfs/bafkreid7fbwjx4swwewit5txzttoja4t4xnkj3rx3q7dlbj76gvixuq35y'
    const name1Value1 = '/ipfs/bafybeihiyjghsq7gob7vj3vurqf5i4eth3h57ixpaajdxtvi7p4snhag2a'
    const name0Record0 = await createNameRecord(name0.privateKey, name0Value0)
    const name0Record1 = await updateNameRecord(name0.privateKey, name0Record0, name0Value1)
    const name1Record0 = await createNameRecord(name1.privateKey, name1Value0)
    const name1Record1 = await updateNameRecord(name1.privateKey, name1Record0, name1Value1)

    const publishRecord = async (key, record) => {
      const publishRes = await fetch(new URL(`name/${key}`, endpoint), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uint8arrays.toString(record, 'base64pad')
      })
      assert(publishRes.ok)
    }

    // listen for updates to name0
    /** @type {import('websocket').connection} */
    const conn = await new Promise((resolve, reject) => {
      const client = new WebSocketClient()
      client.connect(new URL(`name/${name0.id}/watch`, endpoint).toString())
      client.on('connect', resolve).on('connectFailed', reject)
    })

    // we're going to publish on two keys, but we're only listening on one
    // so we should only receive 2 messages.
    const expectedMsgCount = 2
    /** @type {import('websocket').Message[]} */
    const msgs = []
    const deferred = defer()
    conn.on('message', msg => {
      msgs.push(msg)
      if (msgs.length >= expectedMsgCount) {
        deferred.resolve()
      }
    })

    try {
      await publishRecord(name0.id, name0Record0)
      // we should NOT receive an update for this key
      await publishRecord(name1.id, name1Record0)
      // we should NOT receive an update for this key
      await publishRecord(name1.id, name1Record1)
      await publishRecord(name0.id, name0Record1)

      // wait for update message to be received
      await deferred.promise

      assert.strictEqual(msgs.length, expectedMsgCount)
      assert.strictEqual(JSON.parse(msgs[0].utf8Data).value, name0Value0)
      assert.strictEqual(JSON.parse(msgs[1].utf8Data).value, name0Value1)
    } finally {
      conn.close()
    }
  })

  it('watches for publishes to all keys', async () => {
    const token = await getTestJWT()
    const name0 = await createNameKeypair()
    const name1 = await createNameKeypair()
    const name0Value0 = '/ipfs/bafybeiauyddeo2axgargy56kwxirquxaxso3nobtjtjvoqu552oqciudrm'
    const name0Value1 = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
    const name1Value0 = '/ipfs/bafkreid7fbwjx4swwewit5txzttoja4t4xnkj3rx3q7dlbj76gvixuq35y'
    const name1Value1 = '/ipfs/bafybeihiyjghsq7gob7vj3vurqf5i4eth3h57ixpaajdxtvi7p4snhag2a'
    const name0Record0 = await createNameRecord(name0.privateKey, name0Value0)
    const name0Record1 = await updateNameRecord(name0.privateKey, name0Record0, name0Value1)
    const name1Record0 = await createNameRecord(name1.privateKey, name1Value0)
    const name1Record1 = await updateNameRecord(name1.privateKey, name1Record0, name1Value1)

    const publishRecord = async (key, record) => {
      const publishRes = await fetch(new URL(`name/${key}`, endpoint), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uint8arrays.toString(record, 'base64pad')
      })
      assert(publishRes.ok)
    }

    // listen for ALL updates
    /** @type {import('websocket').connection} */
    const conn = await new Promise((resolve, reject) => {
      const client = new WebSocketClient()
      client.connect(new URL('name/*/watch', endpoint).toString())
      client.on('connect', resolve).on('connectFailed', reject)
    })

    // we're going to publish on two keys
    const expectedMsgCount = 4
    /** @type {import('websocket').Message[]} */
    const msgs = []
    const deferred = defer()
    conn.on('message', msg => {
      msgs.push(msg)
      if (msgs.length >= expectedMsgCount) {
        deferred.resolve()
      }
    })

    try {
      await publishRecord(name1.id, name1Record0)
      await publishRecord(name0.id, name0Record0)
      await publishRecord(name1.id, name1Record1)
      await publishRecord(name0.id, name0Record1)

      // wait for update messages to be received
      await deferred.promise

      assert.strictEqual(msgs.length, expectedMsgCount)
      assert.strictEqual(JSON.parse(msgs[0].utf8Data).value, name1Value0)
      assert.strictEqual(JSON.parse(msgs[1].utf8Data).value, name0Value0)
      assert.strictEqual(JSON.parse(msgs[2].utf8Data).value, name1Value1)
      assert.strictEqual(JSON.parse(msgs[3].utf8Data).value, name0Value1)
    } finally {
      conn.close()
    }
  })
})
