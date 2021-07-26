/* eslint-env mocha */
import * as assert from 'uvu/assert'
import { Web3Storage } from 'web3.storage'

describe('get', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('get a CAR', async () => {
    const client = new Web3Storage({ token, endpoint })
    const cid = 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e'
    const res = await client.get(cid)
    assert.ok(res.ok)
    const blob = await res.blob()
    assert.is(
      blob.type,
      'application/car',
      `car type should be set correctly ${blob.type}`
    )
  })

  it('get files', async () => {
    const client = new Web3Storage({ token, endpoint })
    const cid = 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e'
    const res = await client.get(cid)
    assert.ok(res.ok)
    const files = await res.files()
    for (const file of files) {
      assert.is(
        file.cid,
        cid,
        'in a CAR with 1 file, the file name should match the CAR root'
      )
      assert.is(
        file.name,
        cid,
        `name (${file.name}) should be (${cid})`
      )
      assert.ok(file.lastModified)
      assert.is(await file.text(), 'hello world')
    }
    assert.is(files.length, 1, 'should contain 1 file')
  })

  it('get dirs', async () => {
    const client = new Web3Storage({ token, endpoint })
    const cid = 'bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu'
    const res = await client.get(cid)
    assert.ok(res.ok)
    const files = await res.files()
    assert.is(files.length, 3, 'should contain 3 files')
    assert.is(files[0].name, 'dr-is-tired.jpg')
    assert.is(files[0].cid, 'bafkreiabltrd5zm73pvi7plq25pef3hm7jxhbi3kv4hapegrkfpkqtkbme')
    assert.is(files[0].size, 94482)
    assert.is(files[1].name, 'not-distributed.jpg')
    assert.is(files[1].cid, 'bafybeicklkqcnlvtiscr2hzkubjwnwjinvskffn4xorqeduft3wq7vm5u4')
    assert.is(files[1].size, 414201)
    assert.is(files[2].name, 'youareanonsense.jpg')
    assert.is(files[2].cid, 'bafkreiaqv66m5nd6mwgkk7h5lwqnjzj54s4f7knmnrjhb7ylzqfg2vdo54')
    assert.is(files[2].size, 55415)
  })

  it('res.files throws on 404', async () => {
    const client = new Web3Storage({ token, endpoint })
    const cid = 'bafkreieq5jui4j25lacwomsqgjeswwl3y5zcdrresptwgmfylxo2depppq'
    try {
      const res = await client.get(cid)
      assert.not.ok(res.ok)
      await res.files()
      assert.unreachable('res.files() should have thrown')
    } catch (err) {
      assert.match(err, /404/)
    }
  })

  it('res.unixFsIteratory throws on invalid cid', async () => {
    const client = new Web3Storage({ token, endpoint })
    const cid = 'bafkreieq'
    try {
      const res = await client.get(cid)
      assert.not.ok(res.ok)
      for await (const _ of res.unixFsIterator()) { // eslint-disable-line
        assert.unreachable('res.unixFsIterator() should have thrown')
      }
    } catch (err) {
      assert.match(err, /400/)
    }
  })
})
