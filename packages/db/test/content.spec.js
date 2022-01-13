/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index'
import { createUser, createUserAuthKey, token } from './utils.js'

const contentTable = 'content'

describe('Content', () => {
  /** @type {DBClient & {_client: import('@supabase/postgrest-js').PostgrestClient}} */
  const client = (new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token
  }))
  let user
  let authKey

  let createdCid

  const cidToBeCreated = 'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf359'
  const cidToBeCreatedWithPinRequest = 'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf098'
  const anotherCid = 'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf310'
  const yetAnotherCid = 'bafybeiczsscdsbs7aaqz55asqdf3smv6klcw3gofszvwlyarci47bgf102'
  const dagSize = 10

  const cids = [
    cidToBeCreated,
    anotherCid,
    cidToBeCreatedWithPinRequest,
    yetAnotherCid
  ]

  const contentToBeCreated = {
    cid: cidToBeCreated,
    dagSize,
    pins: [{
      status: 'Pinning',
      location: {
        peerId: 'peer_id',
        peerName: 'peer_name',
        region: 'region'
      }
    }]
  }

  // Create user and auth key`
  before(async () => {
    user = await createUser(client)
    authKey = await createUserAuthKey(client, user._id)
  })

  // Guarantee no Pin requests exist and create the ones needed for our tests
  before(async () => {
    // Make sure we don't have pinRequest for the given cids
    for (let i = 0; i < cids.length; i++) {
      const { count: countR } = await client._client.from(contentTable)
        .select('cid', {
          count: 'exact'
        })
        .eq('cid', cids[i])

      assert.strictEqual(countR, 0)
    }

    createdCid = await client.createContent(contentToBeCreated)
  })

  describe('Create Content', () => {
    it('it creates a content row', async () => {
      const { count } = await client._client
        .from(contentTable)
        .select('cid', {
          count: 'exact'
        })
        .eq('cid', cidToBeCreated)
      assert.strictEqual(count, 1)
    })

    it('it returns the created conten cid', async () => {
      assert.strictEqual(cidToBeCreated, createdCid)
    })

    it('it creates a pin request to duplicate data to Pinata', async () => {
      const { count } = await client._client
        .from('pin_request')
        .select('content_cid', {
          count: 'exact'
        })
        .match({
          content_cid: cidToBeCreated
        })
      assert.strictEqual(count, 1)
    })

    it('it creates relative pin row', async () => {
      const { count } = await client._client
        .from('pin')
        .select('id', {
          count: 'exact'
        })
        .eq('content_cid', cidToBeCreated)

      assert.strictEqual(count, 1)
    })

    it('it creates a pin sync request if not pinned', async () => {
      const { data } = await client._client
        .from('pin')
        .select('id')
        .eq('content_cid', cidToBeCreated)
        .single()

      const { count } = await client._client
        .from('pin_sync_request')
        .select('pin_id', {
          count: 'exact'
        })
        .match({
          pin_id: data.id
        })
      assert.strictEqual(count, 1)
    })

    it('it does not add a duplicated content if already exists', async () => {
      const otherContentToBeCreated = {
        cid: anotherCid,
        dagSize: 10,
        pins: [{
          status: 'Pinning',
          location: {
            peerId: 'peer_id_2',
            peerName: 'peer_name_2',
            region: 'region'
          }
        }]
      }

      const { error } = await client
        ._client
        .from(contentTable)
        .insert({
          cid: anotherCid
        })

      if (error) {
        throw new Error()
      }

      await client.createContent(otherContentToBeCreated)

      const { count } = await client._client
        .from(contentTable)
        .select('cid', {
          count: 'exact'
        })
        .match({
          cid: anotherCid
        })

      assert.strictEqual(count, 1)
    })

    it('updates the pinRequest', async () => {
      /**
      * @type {import('../db-client-types').PAPinRequestUpsertInput}
      */
      const aPinRequestInput = {
        requestedCid: cidToBeCreatedWithPinRequest,
        authKey
      }

      /**
       * @type {import('../db-client-types').PAPinRequestUpsertInput}
       */
      const aSecondPinRequestInput = {
        requestedCid: yetAnotherCid,
        authKey
      }

      /**
       * @type {import('../db-client-types').PAPinRequestUpsertOutput}
       */
      const aPinRequestOutput = await client.createPAPinRequest(aPinRequestInput)

      /**
       * @type {import('../db-client-types').PAPinRequestUpsertOutput}
       */
      const aSecondPinRequestOutput = await client.createPAPinRequest(aSecondPinRequestInput)

      const contentWithPinRequest = {
        cid: cidToBeCreatedWithPinRequest,
        dagSize: 10,
        pins: [{
          status: 'Pinning',
          location: {
            peerId: 'peer_id_2',
            peerName: 'peer_name_2',
            region: 'region'
          }
        }]
      }

      await client.createContent(contentWithPinRequest, { updatePinRequests: true })

      const request1 = await client.getPAPinRequest(authKey, aPinRequestOutput._id)
      const request2 = await client.getPAPinRequest(authKey, aSecondPinRequestOutput._id)

      assert.strictEqual(request1.contentCid, cidToBeCreatedWithPinRequest)
      assert.ifError(request2.contentCid)
    })
  })
})
