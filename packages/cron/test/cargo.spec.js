/* eslint-env mocha */
import assert from 'assert'
import { createUpload, getUpload, createUser, createUserAuthKey, getPinSyncRequests } from '@web3-storage/db/test-utils'
import fetch from '@web-std/fetch'
import { getCluster, getDBClient } from '../src/lib/utils.js'
import { updatePinStatuses } from '../src/jobs/pins.js'
import sinon from 'sinon'
import { updateDagSizes } from '../src/jobs/dagcargo.js'

global.fetch = fetch

const env = {
  DEBUG: '*',
  ENV: 'dev',
  CLUSTER_API_URL: 'http://localhost:9094',
  CLUSTER_IPFS_PROXY_API_URL: 'http://127.0.0.1:9095/api/v0/',
  CLUSTER_BASIC_AUTH_TOKEN: 'dGVzdDp0ZXN0',
  DATABASE: 'postgres',
  PG_REST_URL: 'http://localhost:3000',
  PG_REST_JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMzk2ODgzNCwiZXhwIjoyNTUwNjUzNjM0LCJyb2xlIjoic2VydmljZV9yb2xlIn0.necIJaiP7X2T2QjGeV-FhpkizcNTX8HjDDBAxpgQTEI'
}

describe('cron - dag sizes', () => {
  // Writing this spec more as a unit test rather than integration
  // since the db API handling the updating is already well testes
  let dbClient
  let updateStub
  let date

  beforeEach(async () => {
    dbClient = getDBClient(env)
    date = new Date()
    updateStub = sinon.stub(dbClient, 'updateDagSize')
      .onFirstCall()
      .returns(Promise.resolve(Array.from({ length: 1000 }, () => `${Math.floor(Math.random() * 1000)}`)))
      .onSecondCall()
      .returns(Promise.resolve(Array.from({ length: 10 }, () => `${Math.floor(Math.random() * 10)}`)))
      .onThirdCall()
      .returns(Promise.resolve([]))
  })

  it('can calls updateDagSize DB api from specified date', async () => {
    await updateDagSizes({ dbClient, after: date })
    assert.strictEqual(updateStub.args[0][0].from, date)
  })

  it('keeps updating until there is not content left to update', async () => {
    await updateDagSizes({ dbClient, after: date })
    assert.strictEqual(updateStub.callCount, 3)
  })
})
