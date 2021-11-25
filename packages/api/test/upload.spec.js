/* global describe it fetch Blob FormData */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import { getTestJWT } from './scripts/helpers.js'

describe('POST /upload', () => {
  it('should add posted File to Cluster', async () => {
    const name = 'single-file-upload'

    // Create token
    const token = await getTestJWT()

    const file = new Blob(['hello world!'])
    // expected CID for the above data
    const expectedCid = 'bafkreidvbhs33ighmljlvr7zbv2ywwzcmp5adtf4kqvlly67cy56bdtmve'

    const res = await fetch(new URL('upload', endpoint), {
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
    const token = await getTestJWT()

    const body = new FormData()
    const file1 = new Blob(['hello world! 1'])
    const file2 = new Blob(['hello world! 2'])
    body.append('file', file1, 'name1')
    body.append('file', file2, 'name2')

    // expected CID for the above data
    const expectedCid = 'bafkreidekh6xmx5iqumo63i2fipsdtjmpzj4liok7wzptv4tvmnj2ptu6u'

    const res = await fetch(new URL('upload', endpoint), {
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
    const token = await getTestJWT()

    const res = await fetch(new URL('upload', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Name': encodeURIComponent(expectedName)
      },
      body: new Blob(['hello world!'])
    })

    assert(res, 'Server responded')
    // db mock throws 500 if filename was not decoded
    assert(res.ok, 'Server response not ok: filename might not have been decoded.')
  })
})
