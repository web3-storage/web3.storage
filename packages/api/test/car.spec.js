/* global describe it fetch */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import * as JWT from '../src/utils/jwt.js'
import { SALT } from './scripts/worker-globals.js'
import { createCar } from './scripts/car.js'
import { JWT_ISSUER } from '../src/constants.js'

function getTestJWT (sub = 'test', name = 'test') {
  return JWT.sign({ sub, iss: JWT_ISSUER, iat: Date.now(), name }, SALT)
}

describe('POST /car', () => {
  it('should add posted CARs to Cluster', async () => {
    const name = 'car'
    // Create token
    const token = await getTestJWT()

    // Create Car
    const { root, car: carBody } = await createCar('hello world!')

    // expected CID for the above data
    const expectedCid = 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354'
    assert.strictEqual(root.toString(), expectedCid, 'car file has correct root')

    const res = await fetch(new URL('car', endpoint), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/car',
        'X-Name': name
      },
      body: carBody
    })

    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const { cid } = await res.json()
    assert(cid, 'Server response payload has `cid` property')
    assert.strictEqual(cid, expectedCid, 'Server responded with expected CID')
  })
})
