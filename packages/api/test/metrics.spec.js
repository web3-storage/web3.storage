/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'

describe('GET /metrics', () => {
  it('retrieves metrics', async () => {
    const res = await fetch(new URL('metrics/', endpoint))
    assert(res.ok)

    const text = await res.text()
    assert(text.includes('web3storage_users_total'))
    assert(text.includes('web3storage_uploads_total'))
    assert(text.includes('web3storage_content_bytes_total'))
    assert(text.includes('web3storage_pins_total'))
    assert(text.includes('web3storage_pins_bytes_total'))
    assert(text.includes('web3storage_pins_status_queued_total'))
    assert(text.includes('web3storage_pins_status_pinning_total'))
    assert(text.includes('web3storage_pins_status_pinned_total'))
    assert(text.includes('web3storage_pins_status_failed_total'))
  })
})
