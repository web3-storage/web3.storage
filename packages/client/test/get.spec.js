import * as assert from 'uvu/assert'
import { FilecoinStorage, Blob } from 'filecoin.storage'

describe('get', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('get a CAR', async () => {
    const client = new FilecoinStorage({ token, endpoint })
    const cid = 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e'
    const res = await client.get(cid)
    assert.ok(res.ok)
    assert.is(res.cid, cid, 'CID on response should match requested')
    const blob = await res.getCar()
    assert.is(
      blob.type,
      'application/car',
      `car type should be set correctly ${blob.type}`
    )
  })

  it('get files', async () => {
    const client = new FilecoinStorage({ token, endpoint })
    const cid = 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e'
    const res = await client.get(cid)
    assert.ok(res.ok)
    assert.is(res.cid, cid, 'CID on response should match requested')
    let count = 0
    for await (const file of res.getFiles()) {
      count++
      assert.is(
        file.cid.toString(),
        cid,
        'in a CAR with 1 file, the file name should match the CAR root'
      )
      assert.is(file.path, cid)
      const chunks = []
      for await (const chunk of file.content()) {
        chunks.push(chunk)
      }
      const blob = new Blob(chunks)
      const text = await blob.text()
      assert.is(text, 'hello world')
    }
    assert.is(count, 1, 'should contain 1 file')
  })

  it('returns null on 404', async () => {
    const client = new FilecoinStorage({ token, endpoint })
    const cid = 'bafkreieq5jui4j25lacwomsqgjeswwl3y5zcdrresptwgmfylxo2depppq'
    const res = await client.get(cid)
    assert.not.ok(res, 'res should be null')
  })

  it('throws on invalid cid', async () => {
    const client = new FilecoinStorage({ token, endpoint })
    const cid = 'bafkreieq'
    try {
      const blob = await client.get(cid)
      assert.unreachable('sholud have thrown')
    } catch (err) {
      assert.match(err, /400/)
    }
  })
})
