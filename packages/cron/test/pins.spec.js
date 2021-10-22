/* eslint-env mocha */
import execa from 'execa'
import assert from 'assert'

const env = {
  DEBUG: '*',
  ENV: 'dev',
  CLUSTER_API_URL: 'http://localhost:9094',
  CLUSTER_IPFS_PROXY_API_URL: 'http://127.0.0.1:9095/api/v0/',
  CLUSTER_BASIC_AUTH_TOKEN: 'test',
  DATABASE: 'postgres',
  DEV_PG_REST_URL: 'http://localhost:9087',
  DEV_PG_REST_JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMzk2ODgzNCwiZXhwIjoyNTUwNjUzNjM0LCJyb2xlIjoic2VydmljZV9yb2xlIn0.necIJaiP7X2T2QjGeV-FhpkizcNTX8HjDDBAxpgQTEI'
}

describe('cron - pins', () => {
  it('can be executed', async () => {
    const { stderr } = execa.sync('./src/bin/pins.js', { env })
    assert.match(stderr, /pins:updatePinStatuses 📥 Processing 0 -> 4/)
    assert.match(stderr, /pins:updatePinStatuses ⏳ bafy1: Checking status/)
    assert.match(stderr, /pins:updatePinStatuses ⏳ bafy3: Checking status/)
    assert.match(stderr, /pins:updatePinStatuses ⏳ bafy4: Checking status/)
    assert.match(stderr, /pins:updatePinStatuses 📌 bafy1@test-peer-id: Pinning => Pinned/)
    assert.match(stderr, /pins:updatePinStatuses 📌 bafy4@test-peer-id: Pinning => Pinned/)
    assert.match(stderr, /pins:updatePinStatuses 📌 bafy3@test-peer-id: Pinning => Pinned/)
    assert.match(stderr, /pins:updatePinStatuses ⏳ Updating 3 pins/)
    assert.match(stderr, /pins:updatePinStatuses ✅ Updated 3 pins/)
    assert.match(stderr, /pins:updatePinStatuses ⏳ Removing 4 pin sync requests/)
    assert.match(stderr, /pins:updatePinStatuses ✅ Removed 4 pin sync requests/)
    assert.match(stderr, /pins:updatePinStatuses ⏳ Re-queuing 0 pin sync requests/)
    assert.match(stderr, /pins:updatePinStatuses ✅ Re-queued 0 pin sync requests/)
  })
})
