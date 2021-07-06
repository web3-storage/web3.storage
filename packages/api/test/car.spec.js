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
    const { root, car } = await createCar('hello world!')

    // expected CID for the above data
    const cid = 'bafkreidvbhs33ighmljlvr7zbv2ywwzcmp5adtf4kqvlly67cy56bdtmve'
    assert.strictEqual(root.toString(), cid, 'car file has correct root')

    const res = await fetch(new URL('car', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/car',
        Name: name
      },
      body: car,
    })

    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const { ok, value } = await res.json()
    assert(ok, 'Server response payload has `ok` property')
    assert.strictEqual(value.cid, cid, 'Server responded with expected CID')
    assert.strictEqual(value.name, name, 'Server responded with expected CID')
  })

  it('should error when not receiving a car content type', async () => {
    // Create token
    const token = await getTestJWT()

    // Create Car
    const { car } = await createCar('hello world!')

    const res = await fetch(new URL('car', endpoint).toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: car,
    })

    assert(res, 'Server responded')
    assert(res.status, 400)
  })
})
