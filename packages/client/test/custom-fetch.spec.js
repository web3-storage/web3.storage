/* eslint-env mocha */
import * as assert from 'uvu/assert'
import { Web3Storage } from 'web3.storage'
import { File, fetch } from '../src/platform.js'

describe('test custom fetch', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://127.0.0.1:${API_PORT}` : '')

  it('with custom fetch', async () => {
    let result = false

    function customFetch (...opts) {
      result = true
      return fetch(...opts)
    }

    const client = new Web3Storage({ endpoint, token, fetch: customFetch })
    const files = prepareFiles()
    const cid = 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e'

    result = false
    await client.put(files)
    assert.is(result, true)

    result = false
    await client.get(cid)
    assert.is(result, true)

    result = false
    const uploads = []
    for await (const item of client.list()) {
      uploads.push(item)
    }
    assert.is(result, true)
  })
})

function prepareFiles () {
  const data = 'Hello web3.storage!'

  return [
    new File(
      [data],
      '/dir/data.txt'
    )
  ]
}
