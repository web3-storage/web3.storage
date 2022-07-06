/* eslint-env mocha */
import assert from 'assert'
import { createUser, createUpload, randomCid } from '@web3-storage/db/test-utils'
import { getDBClient, getPgPool } from '../src/lib/utils.js'
import { deleteRemotePins } from '../src/jobs/delete-remote-pins.js'

const env = {
  ...process.env,
  ENV: 'dev',
  // Used by tests only to create seed data
  PG_REST_JWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU',
  PG_REST_URL: 'http://127.0.0.1:3000'
}

function getRandomLocation () {
  return {
    peerId: `${Math.floor(Math.random() * 1_000_000)}`,
    peerName: 'web3-storage-sv15',
    region: 'region'
  }
}

describe('Delete remote pins', () => {
  /** @type {import('@web3-storage/db').DBClient} */
  let dbClient
  let rwPgPool
  let cid
  const nRemotePins = 30
  const remotePins = Array(nRemotePins).fill(1).map(i => ({
    status: 'Remote',
    location: getRandomLocation()
  }))

  const otherPins = [
    {
      status: 'Undefined',
      location: getRandomLocation()
    }, {
      status: 'ClusterError',
      location: getRandomLocation()
    }, {
      status: 'PinError',
      location: getRandomLocation()
    }, {
      status: 'UnpinError',
      location: getRandomLocation()
    }, {
      status: 'Pinned',
      location: getRandomLocation()
    }, {
      status: 'Pinning',
      location: getRandomLocation()
    }, {
      status: 'Unpinning',
      location: getRandomLocation()
    }, {
      status: 'Unpinned',
      location: getRandomLocation()
    }, {
      status: 'PinQueued',
      location: getRandomLocation()
    }, {
      status: 'UnpinQueued',
      location: getRandomLocation()
    }, {
      status: 'Sharded',
      location: getRandomLocation()
    }, {
      status: 'UnexpectedlyUnpinned',
      location: getRandomLocation()
    }
  ]

  before(async () => {
    rwPgPool = await getPgPool(env, 'rw')
    dbClient = await getDBClient(env)

    const user = await createUser(dbClient)
    cid = await randomCid()
    await createUpload(dbClient, user._id, undefined, cid, {
      pins: [...remotePins, ...otherPins]
    })
    const pins = await dbClient.getPins(cid)
    assert.strictEqual(pins.length, remotePins.length + otherPins.length)

    await deleteRemotePins({ rwPgPool, batchSize: 5 })
  })

  after(async () => {
    await rwPgPool.end()
  })

  beforeEach(async () => {
    const user = await createUser(dbClient)
    cid = await randomCid()
    await createUpload(dbClient, user._id, undefined, cid, {
      pins: [...remotePins, ...otherPins]
    })
    const pins = await dbClient.getPins(cid)
    assert.strictEqual(pins.length, remotePins.length + otherPins.length)

    await deleteRemotePins({ rwPgPool, batchSize: 5 })
  })

  it('deletes remote pins and not the others', async () => {
    const pins = await dbClient.getPins(cid)

    assert.strictEqual(pins.length, otherPins.length, 'It did not remove the pins')
    assert.strictEqual(pins.filter(p => p.status === 'Remote').length, 0, 'Some remote pins are still there')
  })
})
