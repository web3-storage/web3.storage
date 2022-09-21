/* eslint-env mocha, browser */
import assert from 'assert'
import fetch, { Blob } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { getTestJWT } from './scripts/helpers.js'
import { AccountRestrictedError, PinningUnauthorizedError } from '../src/errors.js'
import { createCar } from './scripts/car.js'

const EMAIL_ERROR_MESSAGE = 'Error message does not contain support email address'
const RESTRICTED_ERROR_CHECK = /This account is restricted./
const SUPPORT_EMAIL_CHECK = /support@web3.storage/
const SUPPORT_WEBSITE_CHECK = /pinning-services-api/

describe('Pinning service API access', () => {
  const cid = 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
  let notAuthorizedToken

  before(async () => {
    notAuthorizedToken = await getTestJWT()
  })

  describe('GET /pins', () => {
    it('should throw if user not authorized to pin', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${notAuthorizedToken}`,
          'Content-Type': 'application/json'
        }
      })

      assert(!res.ok)
      const { error: { reason, details } } = await res.json()
      assert.match(details, SUPPORT_WEBSITE_CHECK, EMAIL_ERROR_MESSAGE)
      assert.strictEqual(reason, PinningUnauthorizedError.CODE)
    })
  })

  describe('GET /pins/:requestId', () => {
    it('should throw if user not authorized to pin', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notAuthorizedToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cid })
      })

      assert(!res.ok)
      const { error: { reason, details } } = await res.json()
      assert.match(details, SUPPORT_WEBSITE_CHECK, EMAIL_ERROR_MESSAGE)
      assert.strictEqual(reason, PinningUnauthorizedError.CODE)
    })
  })

  describe('POST /pins', () => {
    it('should throw if user not authorized to pin', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notAuthorizedToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cid })
      })

      assert(!res.ok)
      const { error: { reason, details } } = await res.json()
      assert.match(details, SUPPORT_WEBSITE_CHECK, EMAIL_ERROR_MESSAGE)
      assert.strictEqual(reason, PinningUnauthorizedError.CODE)
    })
  })

  describe('POST /pins/:requestId', () => {
    it('should throw if user not authorized to pin', async () => {
      const res = await fetch(new URL('pins/UniqueIdOfPinRequest', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notAuthorizedToken}`,
          'Content-Type': 'application/json'
        }
      })

      assert(!res.ok)
      const { error: { reason, details } } = await res.json()
      assert.match(details, SUPPORT_WEBSITE_CHECK, EMAIL_ERROR_MESSAGE)
      assert.strictEqual(reason, PinningUnauthorizedError.CODE)
    })
  })

  describe('DELETE /pins/:requestId', () => {
    it('should throw if user not authorized to pin', async () => {
      const res = await fetch(new URL('pins/1', endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${notAuthorizedToken}`,
          'Content-Type': 'application/json'
        }
      })

      assert(!res.ok)
      const { error: { reason, details } } = await res.json()
      assert.match(details, SUPPORT_WEBSITE_CHECK, EMAIL_ERROR_MESSAGE)
      assert.strictEqual(reason, PinningUnauthorizedError.CODE)
    })
  })
})

describe('Account restriction', () => {
  let restrictedToken
  let restrictedTokenPSAEnabled

  before(async () => {
    restrictedToken = await getTestJWT('test-restriction', 'test-restriction')
    restrictedTokenPSAEnabled = await getTestJWT('test-pinning-and-restriction', 'test-pinning-and-restriction')
  })

  describe('POST /car', () => {
    it('should throw if account is restricted', async () => {
      const { car: carBody } = await createCar('hello world!')

      const res = await fetch(new URL('car', endpoint), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${restrictedToken}`,
          'Content-Type': 'application/vnd.ipld.car',
          'X-Name': 'car'
        },
        body: carBody
      })

      assert.strictEqual(res.ok, false)
      const { code, message } = await res.json()
      assert.strictEqual(code, AccountRestrictedError.CODE)
      assert.match(message, RESTRICTED_ERROR_CHECK)
      assert.match(message, SUPPORT_EMAIL_CHECK, EMAIL_ERROR_MESSAGE)
    })
  })

  describe('POST /pins', () => {
    let baseUrl

    before(async () => {
      baseUrl = new URL('pins', endpoint).toString()
    })

    it('should throw if account is PSA enabled, but restricted', async () => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${restrictedTokenPSAEnabled}`
        },
        body: JSON.stringify({
          cid: 'abc'
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, 403)
      const { error: { reason, details } } = await res.json()
      assert.strictEqual(reason, AccountRestrictedError.CODE)
      assert.match(details, RESTRICTED_ERROR_CHECK)
      assert.match(details, SUPPORT_EMAIL_CHECK, EMAIL_ERROR_MESSAGE)
    })

    it('should throw if account is restricted', async () => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${restrictedToken}`
        },
        body: JSON.stringify({
          cid: 'abc'
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, 403)
      const { error: { reason, details } } = await res.json()
      assert.strictEqual(reason, AccountRestrictedError.CODE)
      assert.match(details, RESTRICTED_ERROR_CHECK)
      assert.match(details, SUPPORT_EMAIL_CHECK, EMAIL_ERROR_MESSAGE)
    })
  })

  describe('POST /pins/:requestId', () => {
    let baseUrl

    before(async () => {
      baseUrl = new URL('pins/UniqueIdOfPinRequest', endpoint).toString()
    })

    it('should throw if account is PSA enabled, but restricted', async () => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${restrictedTokenPSAEnabled}`
        },
        body: JSON.stringify({
          cid: 'abc'
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, 403)
      const { error: { reason, details } } = await res.json()
      assert.strictEqual(reason, AccountRestrictedError.CODE)
      assert.match(details, RESTRICTED_ERROR_CHECK)
      assert.match(details, SUPPORT_EMAIL_CHECK, EMAIL_ERROR_MESSAGE)
    })

    it('should throw if account is restricted', async () => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${restrictedToken}`
        },
        body: JSON.stringify({
          cid: 'abc'
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, 403)
      const { error: { reason, details } } = await res.json()
      assert.strictEqual(reason, AccountRestrictedError.CODE)
      assert.match(details, RESTRICTED_ERROR_CHECK)
      assert.match(details, SUPPORT_EMAIL_CHECK, EMAIL_ERROR_MESSAGE)
    })
  })

  describe('POST /upload', () => {
    it('should throw if account is restricted', async () => {
      const name = 'single-file-upload'
      const file = new Blob(['hello world!'])

      const res = await fetch(new URL('upload', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${restrictedToken}`,
          'X-Name': name
        },
        body: file
      })

      assert.strictEqual(res.ok, false)
      const { code, message } = await res.json()
      assert.strictEqual(code, AccountRestrictedError.CODE)
      assert.match(message, RESTRICTED_ERROR_CHECK)
      assert.match(message, SUPPORT_EMAIL_CHECK, EMAIL_ERROR_MESSAGE)
    })
  })
})
