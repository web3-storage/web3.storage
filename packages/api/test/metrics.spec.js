/* eslint-env mocha */
import assert from 'assert'
import fetch from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'

describe('GET /metrics', () => {
  it('retrieves metrics', async () => {
    const res = await fetch(new URL('metrics/', endpoint))
    assert(res.ok)

    const text = await res.text()
    assert(text.includes('web3storage_users_total'))
    assert(text.includes('web3storage_uploads_total'))
    assert(text.includes('web3storage_uploads_total{type="Car"}'))
    assert(text.includes('web3storage_uploads_total{type="Blob"}'))
    assert(text.includes('web3storage_uploads_total{type="Multipart"}'))
    assert(text.includes('web3storage_uploads_total{type="Upload"}'))
    assert(text.includes('web3storage_content_bytes_total'))
    assert(text.includes('web3storage_pins_total'))
    assert(text.includes('web3storage_pins_total{status="PinQueued"}'))
    assert(text.includes('web3storage_pins_total{status="Pinning"}'))
    assert(text.includes('web3storage_pins_total{status="Pinned"}'))
    assert(text.includes('web3storage_pins_total{status="PinError"}'))
    assert(text.includes('web3storage_pin_requests_total'))
  })
})
