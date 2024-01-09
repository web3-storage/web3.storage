/* eslint-env mocha */
import assert from 'assert'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import fetch from '@web-std/fetch'

import {
  withMode,
  READ_WRITE,
  READ_ONLY,
  NO_READ_OR_WRITE
} from '../src/maintenance.js'
import { CAR_CODE } from '../src/constants.js'

import { endpoint } from './scripts/constants.js'
import { createCar } from './scripts/car.js'
import { getTestJWT } from './scripts/helpers.js'

// client needs global fetch
Object.assign(global, { fetch })

describe('maintenance middleware', () => {
  it('should throw error when in maintenance for a READ_ONLY route', () => {
    const handler = withMode(READ_ONLY)
    const block = (request, env) => {
      handler(request, env)
    }

    // READ WRITE MODE
    assert.doesNotThrow(() => block(() => {}, {
      MODE: READ_WRITE
    }))

    // READ ONLY MODE
    assert.doesNotThrow(() => block(() => {}, {
      MODE: READ_ONLY
    }))

    // NO READ OR WRITE MODE
    assert.throws(() => block(() => { }, {
      MODE: NO_READ_OR_WRITE
    }), /API undergoing maintenance/)
  })

  it('should throw error when in maintenance and READ_ONLY for a READ_WRITE route', () => {
    const handler = withMode(READ_WRITE)
    const block = (request, env) => {
      handler(request, env)
    }

    // READ WRITE MODE
    assert.doesNotThrow(() => block(() => { }, {
      MODE: READ_WRITE
    }))

    // READ ONLY MODE
    assert.throws(() => block(() => { }, {
      MODE: READ_ONLY
    }), /API undergoing maintenance/)

    // NO READ OR WRITE MODE
    assert.throws(() => block(() => { }, {
      MODE: NO_READ_OR_WRITE
    }), /API undergoing maintenance/)

    // after product sunset, READ_ONLY means FeatureHasBeenSunset
    assert.throws(() => block(() => { }, {
      MODE: READ_ONLY,
      NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START: (new Date(0)).toISOString()
    }), /FeatureHasBeenSunset/)
  })

  it('should bypass maintenance mode with a allowed token', async () => {
    const { root, car: carBody } = await createCar('dude where\'s my CAR')
    const carBytes = new Uint8Array(await carBody.arrayBuffer())
    const expectedCid = root.toString()
    const expectedCarCid = CID.createV1(CAR_CODE, await sha256.digest(carBytes)).toString()

    // Allowed token
    const issuer = 'test-upload'
    const token = await getTestJWT(issuer, issuer)

    /** @type {import('miniflare').Miniflare} */
    const mf = globalThis.miniflare
    const bindings = await mf.getBindings()
    bindings.MAINTENANCE_MODE = 'r-'
    bindings.MODE_SKIP_LIST = JSON.stringify([token])

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: carBody
    })
    assert.strictEqual(res.status, 200)
    const { cid, carCid } = await res.json()
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')
    assert.strictEqual(carCid, expectedCarCid, 'Server responded with expected CAR CID')

    // Not allowed token
    const notAllowedIssuer = 'test-upload-not-allowed'
    const notAllowedToken = await getTestJWT(notAllowedIssuer, notAllowedIssuer)

    const notAllowedRes = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notAllowedToken}`,
        'Content-Type': 'application/vnd.ipld.car'
      },
      body: carBody
    })
    assert.strictEqual(notAllowedRes.status, 503)

    // fallback maintenance mode
    bindings.MAINTENANCE_MODE = 'rw'
  })

  it('should throw for invalid maintenance mode', () => {
    const handler = withMode(READ_WRITE)
    const block = (request, env) => {
      handler(request, env)
    }

    const invalidModes = ['', null, undefined, ['r', '-'], 'rwx']
    invalidModes.forEach((m) => {
      assert.throws(() => block(() => {}, {
        MODE: m
      }), /invalid maintenance mode/)
    })
  })

  it('should not allow invalid handler mode', () => {
    assert.throws(
      () => withMode(NO_READ_OR_WRITE),
      /invalid mode/
    )
  })
})
