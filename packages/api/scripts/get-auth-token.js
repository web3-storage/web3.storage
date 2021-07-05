/**
 * Temporary utility to obtain an auth token for using the API.
 *
 * It creates a new user and token in your Fauna database.
 *
 * Usage:
 *     SALT=<SECRET> FAUNA_KEY=<SECRET> node get-auth-token.js
 */
import { DBClient, gql } from '@web3-storage/db'
import * as JWT from '../src/utils/jwt.js'
import { webcrypto as crypto } from 'crypto'

global.crypto = crypto

async function main () {
  const { FAUNA_KEY, SALT } = process.env
  if (!FAUNA_KEY) throw new Error('missing FAUNA_KEY environment variable')
  if (!SALT) throw new Error('missing SALT environment variable')

  const db = new DBClient({ token: FAUNA_KEY })

  const id = Date.now()
  const userData = {
    name: `User ${id}`,
    issuer: `issuer-${id}`,
    picture: '',
    email: `user_${id}@exmaple.org`,
    publicAddress: `0x${id}`
  }

  const { createOrUpdateUser: user } = await db.query(gql`
    mutation CreateOrUpdateUser($data: CreateOrUpdateUserInput!) {
      createOrUpdateUser(data: $data) {
        _id
        name
        issuer
        picture
        email
      }
    }
  `, { data: userData })

  console.log('User:\n', user)

  const secret = await JWT.sign({
    sub: userData.issuer,
    iss: 'web3-storage',
    iat: Date.now(),
    name: `token-${id}`
  }, SALT)

  const { createAuthToken: token } = await db.query(gql`
    mutation CreateAuthToken($data: CreateAuthTokenInput!) {
      createAuthToken(data: $data) {
        _id
        secret
      }
    }
  `, { data: { user: user._id, secret, name: `token-${id}` } })

  console.log('Auth Token:\n', token)
}

main()
