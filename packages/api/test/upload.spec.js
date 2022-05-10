/* eslint-env mocha */
import assert from 'assert'
import fetch, { FormData, Blob } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { getTestJWT } from './scripts/helpers.js'

describe('POST /upload', () => {
  it('should add posted File to Cluster', async () => {
    const name = 'single-file-upload'

    // Create token
    const token = await getTestJWT('test-upload', 'test-upload')

    const file = new Blob(['hello world!'])
    // expected CID for the above data
    const expectedCid = 'bafkreidvbhs33ighmljlvr7zbv2ywwzcmp5adtf4kqvlly67cy56bdtmve'

    const res = await fetch(new URL('upload', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Name': name
      },
      body: file
    })

    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const { cid } = await res.json()
    assert(cid, 'Server response payload has `cid` property')
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')
  })

  it('should add posted Files (dir) to Cluster', async () => {
    const name = 'directory-upload'
    // Create token
    const token = await getTestJWT('test-upload', 'test-upload')

    const body = new FormData()
    const file1 = new Blob(['hello world! 1'])
    const file2 = new Blob(['hello world! 2'])
    body.append('file', file1, 'name1')
    body.append('file', file2, 'name2')

    // expected CID for the above data
    const expectedCid = 'bafkreidekh6xmx5iqumo63i2fipsdtjmpzj4liok7wzptv4tvmnj2ptu6u'

    const res = await fetch(new URL('upload', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Name': name
      },
      body
    })

    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const { cid } = await res.json()
    assert(cid, 'Server response payload has `cid` property')
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')
  })

  it('should decode filename from header', async () => {
    const expectedName = 'filename–with–funky–chars'

    // Create token
    const token = await getTestJWT('test-upload', 'test-upload')

    const res = await fetch(new URL('upload', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Name': encodeURIComponent(expectedName)
      },
      body: new Blob(['hello world!'])
    })

    assert(res, 'Server responded')
    console.log('adam-debug: token:', token)
    console.log('adam-debug: URL:', new URL('upload', endpoint).toString())
    console.log('adam-debug: object keys:', Object.keys(res))
    console.log('adam-debug: res.ok:', res.ok)
    console.log('adam-debug: res.status:', res.status)
    console.log('adam-debug: res.body:', res.body)
    console.log('adam-debug: res.headers:', res.headers)
    console.log('adam-debug: res.text:', await res.text())
    // db mock throws 500 if filename was not decoded
    assert(res.ok, 'Server response not ok: filename might not have been decoded.')
  })
})
