/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import * as JWT from '../src/utils/jwt.js'
import { SALT } from './scripts/worker-globals.js'

describe('GET /user/tokens', () => {
  it('retrieves user tokens', async () => {
    const issuer = 'test'
    const token = await JWT.sign({
      sub: issuer,
      iss: 'web3-storage',
      iat: Date.now(),
      name: 'test'
    }, SALT)

    const res = await fetch(new URL('user/tokens', endpoint).toString(), {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(await res.json())
  })
})
