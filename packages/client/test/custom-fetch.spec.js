/* eslint-env mocha */
import * as assert from 'uvu/assert'
import { Web3Storage } from 'web3.storage'
import { File, fetch } from '../src/platform.js'

describe('test customFetch', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('without customFetch', async () => {
    // @ts-ignore
    const client = new Web3Storage({ endpoint, token })
    const files = prepareFiles()
    const cid = 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e'
    const result = false

    await client.put(files)
    await client.get(cid)
    await client.list()

    assert.is(result, false)
    assert.is(result, false)
    assert.is(result, false)
  })

  it('with customFetch', async () => {
    // @ts-ignore
    let result = false

    function customFetch (...opts) {
      result = true

      fetch(...opts)
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
    await client.list()
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
