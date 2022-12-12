/* eslint-env mocha, browser */
import assert from 'assert'
import fetch from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { getTestJWT } from './scripts/helpers.js'
import {
  DATA_NOT_FOUND,
  ERROR_CODE,
  INVALID_CID,
  getEffectivePinStatus
} from '../src/utils/psa.js'
import { PSAErrorResourceNotFound, PSAErrorInvalidData, PSAErrorRequiredData, PSACodecNotSupported } from '../src/errors.js'
import * as raw from 'multiformats/codecs/raw'
import * as pb from '@ipld/dag-pb'
import * as dagJson from '@ipld/dag-json'
import * as dagCbor from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { CID } from 'multiformats/cid'

const REQUEST_EXPECTED_PROPERTIES = ['requestid', 'status', 'created', 'delegates', 'info', 'pin']
const PIN_EXPECTED_PROPERTIES = ['cid', 'name', 'origins', 'meta']

/**
 *
 * @param {import('../../db/postgres/pg-rest-api-types').definitions['pin']['status']} status
 * @returns {import('../../db/db-client-types.js').PinItemOutput}
 */
const createPinWithStatus = (status) => {
  const now = new Date().toISOString()
  return {
    _id: (Math.random() * 100).toString(),
    status: status,
    created: now,
    updated: now,
    peerId: (Math.random() * 100).toString(),
    peerName: 'name',
    region: 'region'
  }
}

/**
 *
 * @param {object} data
 */
const assertCorrectPinResponse = (data) => {
  assert.ok(typeof data.requestid === 'string', 'requestId should be a string')
  assert.doesNotThrow(() => parseInt(data.requestid, 10), 'requestId is a stringified number')
  assert.ok(typeof data.status === 'string', 'status should be a string')
  assert.ok(['queued', 'pinning', 'pinned', 'failed'].includes(data.status), 'it has a valid status')
  assert.ok(Date.parse(data.created), 'created should be valid date string')
  assert.ok(Array.isArray(data.delegates), 'delegates should be an array')

  // @ts-ignore https://github.com/microsoft/TypeScript/issues/44253
  if (Object.hasOwn(data, 'info')) {
    assert.ok(typeof data.info === 'object', 'info should be an object')
  }

  assert.ok(typeof data.pin === 'object', 'pin should be an object')
  assert.ok(typeof data.pin.cid === 'string', 'pin.cid should be an string')

  // @ts-ignore https://github.com/microsoft/TypeScript/issues/44253
  if (Object.hasOwn(data.pin, 'name')) {
    assert.ok(typeof data.pin.name === 'string', 'pin.name should be an string')
  }

  // @ts-ignore https://github.com/microsoft/TypeScript/issues/44253
  if (Object.hasOwn(data.pin, 'origins')) {
    assert.ok(Array.isArray(data.pin.origins), 'pin.origins should be an array')
  }

  // @ts-ignore https://github.com/microsoft/TypeScript/issues/44253
  if (Object.hasOwn(data.pin, 'meta')) {
    assert.ok(typeof data.pin.meta === 'object', 'pin.meta should be an object')
  }

  assert.ok(Object.keys(data).every(property => REQUEST_EXPECTED_PROPERTIES.includes(property)), 'request contains not valid properties')
  assert.ok(Object.keys(data.pin).every(property => PIN_EXPECTED_PROPERTIES.includes(property)), 'request.pin contains not valid properties')
}

/**
 *
 * @param {object} data
 */
const assertCorretPinResponseList = (data) => {
  assert.ok(typeof data.count === 'number', 'count should be a number')
  data.results.forEach(r => assertCorrectPinResponse(r))
  Object.keys(data).every(property => ['count', 'results'].includes(property))
}

/**
 *
 * @param {string} cid
 * @param {string} token
 * @return {Promise<import('../src/pins.js').PsaPinStatusResponse>}
 */
const createPinRequest = async (cid, token) => {
  return await (await fetch(new URL('pins', endpoint).toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ cid })
  })).json()
}

describe('Pinning APIs endpoints', () => {
  describe('GET /pins', () => {
    let baseUrl
    let token

    before(async () => {
      baseUrl = new URL('pins', endpoint).toString()
      token = await getTestJWT('test-pinning', 'test-pinning')
    })

    it('returns unauthorized if no token', async () => {
      const res = await fetch(new URL('pins/1', endpoint).toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      assert(res, 'Server responded')
      assert(!res.ok)
      assert.deepEqual(res.status, 401)
    })

    it('validates limit value passed as filter', async () => {
      const opts = new URLSearchParams({
        limit: '3.14'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, '#/limit: Instance type "number" is invalid. Expected "integer".')
    })

    it('validates meta filter is json object', async () => {
      const opts = new URLSearchParams({
        meta: `[
          "invalid",
          "json"
        ]`
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, '#/meta: Instance type "array" is invalid. Expected "object".')
    })

    it('validates meta filter values must be strings', async () => {
      const opts = new URLSearchParams({
        meta: `{
          "app-id": "app-001",
          "not-a-string-value": 99
        }`
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, '#/meta/not-a-string-value: Instance type "number" is invalid. Expected "string".')
    })

    it('validates CID values passed as filter', async () => {
      const cids = [
        'notAValidCID',
        'bafybeia45bscvzxngto555xsel4gwoclb5fxd7zpxige7rl3maoleznswu',
        'bafybeid46f7zggioxjm5p2ze2l6s6wbqvoo4gzbdzfjtdosthmfyxdign4'
      ]

      const url = new URL(`${baseUrl}?cid=${cids.join(',')}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, INVALID_CID)
    })

    it('validates status values passed as filter', async () => {
      const opts = new URLSearchParams({
        status: 'pinning,badStatus'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, '#/status/1: Instance does not match any of ["queued","pinning","pinned","failed"].')
    })

    it('validates match values passed as filter', async () => {
      const opts = new URLSearchParams({
        match: 'badMatch'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, '#/match: Instance does not match any of ["exact","iexact","ipartial","partial"].')
    })

    it('returns only successful pins when no filter values are specified', async () => {
      const opts = new URLSearchParams({})
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
      assertCorretPinResponseList(data)
    })

    it('filters pins on CID, for this user', async () => {
      const cids = [
        'bafybeid46f7zggioxjm5p2ze2l6s6wbqvoo4gzbdzfjtdosthmfyxdign4', // Pinned
        'bafybeia45bscvzxngto555xsel4gwoclb5fxd7zpxige7rl3maoleznswu', // PinError
        'bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4' // Not exists
      ]
      const opts = new URLSearchParams({
        cid: cids.join(','),
        status: 'failed,queued,pinning,pinned'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 2)
      assertCorretPinResponseList(data)
    })

    it('filters case sensitive exact match on name', async () => {
      const opts = new URLSearchParams({
        name: 'ReportDoc.pdf',
        status: 'pinned'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
      assertCorretPinResponseList(data)
    })

    it('filters case insensitive partial match on name', async () => {
      const opts = new URLSearchParams({
        name: 'image',
        match: 'ipartial',
        status: 'failed,queued,pinning,pinned'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 4)
      assertCorretPinResponseList(data)
    })

    it('filters pins by status', async () => {
      const opts = new URLSearchParams({
        status: 'failed'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
      assert.strictEqual(data.results.length, 1)
      assert.strictEqual(data.results[0].pin.name, 'FailedPinning.doc')
      assertCorretPinResponseList(data)
    })

    it('filters pins by multiple statuses', async () => {
      const opts = new URLSearchParams({
        status: 'queued,pinning'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 5)
      assertCorretPinResponseList(data)
    })

    it('filters pins by queued', async () => {
      const opts = new URLSearchParams({
        status: 'queued'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
      assertCorretPinResponseList(data)
    })

    it('filters pins created before a date', async () => {
      const opts = new URLSearchParams({
        before: '2021-07-01T00:00:00.000000Z',
        status: 'failed,queued,pinning,pinned'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.results.length, 1)
      assert.strictEqual(data.count, 1)
      assertCorretPinResponseList(data)
    })

    it('filters pins created after a date', async () => {
      const opts = new URLSearchParams({
        after: '2021-07-15T00:00:00.000000Z',
        status: 'failed,queued,pinning,pinned'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.results.length, 2)
      assert.strictEqual(data.count, 2)
      assertCorretPinResponseList(data)
    })

    it('limits the number of pins returned for this user and includes the total', async () => {
      const opts = new URLSearchParams({
        limit: '3',
        status: 'failed,queued,pinning,pinned'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 7)
      assert.strictEqual(data.results.length, 3)
      assertCorretPinResponseList(data)
    })

    it('filters pins by meta', async () => {
      const opts = new URLSearchParams({
        status: 'pinning',
        meta: '{"app_id": "99986338-1113-4706-8302-4420da6158bb", "region": "europe"}'
      })
      const url = new URL(`${baseUrl}?${opts}`).toString()
      const res = await fetch(
        url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      const data = await res.json()
      assert.strictEqual(data.count, 1)
      assert.strictEqual(data.results[0].pin.name, 'Image.jpeg')
      assertCorretPinResponseList(data)
    })
  })

  describe('POST /pins', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('test-pinning', 'test-pinning')
    })

    it('should receive pin data containing cid', async () => {
      const cid = 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cid })
      })

      assert(res, 'Server responded')
      assert(res.ok, 'Server response ok')
      const data = await res.json()
      assertCorrectPinResponse(data)
      assert.strictEqual(data.pin.cid, cid)
      console.log(data.pin.cid, cid)
      assert.strictEqual(data.pin.name, undefined)
      assert.strictEqual(data.pin.origins, undefined)
      assert.strictEqual(data.pin.meta, undefined)
    })

    it('requires cid', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorRequiredData.CODE)
      assert.strictEqual(error.details, 'Instance does not have required property "cid".')
    })

    it('throws error if cid is invalid', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid: 'abc'
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, INVALID_CID)
    })

    it('throws error if not supported codec', async () => {
      const hash = await sha256.digest(Buffer.from(Math.random().toString()))
      const cid = CID.create(1, 72, hash).toString()

      const res = await fetch(new URL('pins', endpoint), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSACodecNotSupported.CODE)
    })

    it('does not throw for supported codec', async () => {
      const SUPPORTED_CODECS = [
        raw.code,
        pb.code,
        dagCbor.code,
        dagJson.code
      ]

      const hash = await sha256.digest(Buffer.from(Math.random().toString()))

      SUPPORTED_CODECS.forEach(async (code) => {
        const cid = CID.create(1, code, hash).toString()
        const res = await fetch(new URL('pins', endpoint), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            cid: cid.toString()
          })
        })

        assert(res, 'Server responded')
        assert(res.ok, 'Not an error')
      })
    })

    it('should receive pin data containing cid, name, origin, meta', async () => {
      const cid = 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
      const name = 'PreciousData.pdf'
      const origins = [
        '/ip6/2606:4700:60::6/tcp/4009/p2p/QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N',
        '/ip4/172.65.0.13/tcp/4009/p2p/QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx4N'
      ]
      const meta = { app_id: '99986338-1113-4706-8302-4420da6158aa' }

      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid,
          name,
          origins,
          meta
        })
      })

      const data = await res.json()
      assert(res, 'Server responded')
      assert(res.ok, 'Server response ok')
      assertCorrectPinResponse(data)
      assert.strictEqual(data.pin.cid, cid)
      assert.deepStrictEqual(data.pin.name, name)
      assert.deepStrictEqual(data.pin.origins, origins)
      assert.deepStrictEqual(data.pin.meta, meta)
    })

    it('validates name', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
          name: 1
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, '#/name: Instance type "number" is invalid. Expected "string".')
    })

    it('validates origins', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
          origins: 1
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, '#/origins: Instance type "number" is invalid. Expected "array".')
    })

    it('validates meta', async () => {
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e',
          meta: 1
        })
      })

      assert(res, 'Server responded')
      assert.strictEqual(res.status, ERROR_CODE)
      const { error } = await res.json()
      assert.strictEqual(error.reason, PSAErrorInvalidData.CODE)
      assert.strictEqual(error.details, '#/meta: Instance type "number" is invalid. Expected "object".')
    })

    it('returns the pin request', async () => {
      const sourceCid = 'bafybeidhbtemubjbsbuhyai5oaebqf2fdrvhnshbkncyqpnoy2bl2mpt4q'
      const res = await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cid: sourceCid
        })
      })

      assert(res.ok)
      const data = await res.json()
      assertCorrectPinResponse(data)
      assert.strictEqual(data.pin.cid, sourceCid)
      assert.notDeepEqual(data.status, 'failed')
    })
  })

  describe('GET /pins/:requestId', () => {
    let token = null

    before(async () => {
      token = await getTestJWT('test-pinning', 'test-pinning')
      const cid = 'bafybeihy6bymmfcdjdrkhaha2srphnhrewimtkdxdmcama2dpgvpyx4efu'
      await (await fetch(new URL('pins', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cid })
      })).json()
    })

    it('returns unauthorized if no token', async () => {
      const res = await fetch(new URL('pins/1', endpoint).toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      assert(res, 'Server responded')
      assert(!res.ok)
      assert.deepEqual(res.status, 401)
    })

    it('returns not found if the request does not exists', async () => {
      const pinThatDoesNotExists = 100
      const res = await fetch(new URL(`pins/${pinThatDoesNotExists}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      assert(res, 'Server responded')
      assert.deepEqual(res.status, 404)
    })

    it('returns not found if the request does not belong to the user token', async () => {
      const wrongToken = await getTestJWT('test-pinning-2', 'test-pinning-2')
      const res = await fetch(new URL('pins/ab62cf3c-c98d-494b-a756-b3a3fb6ddcab', endpoint).toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${wrongToken}` }
      })

      assert(res, 'Server responded')
      assert.deepEqual(res.status, 404)
    })

    it('returns the pin request', async () => {
      const requestId = 'ab62cf3c-c98d-494b-a756-b3a3fb6ddcab'
      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      assertCorrectPinResponse(data)
      assert.strictEqual(data.requestid, requestId)
      assert.strictEqual(data.status, 'pinned')
      assert.strictEqual(data.pin.cid, 'bafybeid46f7zggioxjm5p2ze2l6s6wbqvoo4gzbdzfjtdosthmfyxdign4')
    })

    it('returns the pin request with specified name', async () => {
      const requestId = 'bebd5f62-1381-4124-93a1-1e4eeed52635'
      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      assertCorrectPinResponse(data)
      assert.strictEqual(data.requestid, requestId.toString())
      assert.strictEqual(data.pin.name, 'reportdoc.pdf')
    })

    it('returns the pin request with specified metadata', async () => {
      const requestId = 'bebd5f62-1381-4124-93a1-1e4eeed52635'
      const meta = { app_id: '99986338-1113-4706-8302-4420da6158aa' }
      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      assertCorrectPinResponse(data)
      assert.strictEqual(data.requestid, requestId.toString())
      assert.deepStrictEqual(data.pin.meta, meta)
    })

    it('returns the pin request with specified origins', async () => {
      const requestId = 'ab62cf3c-c98d-494b-a756-b3a3fb6ddcab'
      const origins = [
        '/ip6/2606:4700:60::6/tcp/4009/p2p/QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N',
        '/ip4/172.65.0.13/tcp/4009/p2p/QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx4N'
      ]

      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()

      assert(res, 'Server responded')
      assert(res.ok, 'Server response is ok')
      assertCorrectPinResponse(data)
      assert.strictEqual(data.requestid, requestId.toString())
      assert.deepStrictEqual(data.pin.origins, origins)
    })
  })

  describe('getEffectivePinStatus', () => {
    it('should return pinned if at it is pinned in at least a node', () => {
      /** @type {import('../../db/db-client-types.js').PinItemOutput[]} */
      const pins = [
        createPinWithStatus('Pinned'),
        createPinWithStatus('PinQueued'),
        createPinWithStatus('PinError')
      ]
      assert.strictEqual(getEffectivePinStatus(pins), 'pinned')
    })

    it('should return queued if there are no pins yet', () => {
      const pins = []
      assert.strictEqual(getEffectivePinStatus(pins), 'failed')
    })

    it('should return "queued" if at least 1 pin has it queued', () => {
      const pins = [
        createPinWithStatus('UnpinQueued'),
        createPinWithStatus('PinError'),
        createPinWithStatus('PinQueued')
      ]
      assert.strictEqual(getEffectivePinStatus(pins), 'queued')
    })

    it('should return "queued" if at least 1 pin has Unpinned status', () => {
      const pins = [
        createPinWithStatus('PinError'),
        createPinWithStatus('PinError'),
        createPinWithStatus('Unpinned')
      ]

      assert.strictEqual(getEffectivePinStatus(pins), 'queued')
    })

    it('should return failed if pins have statuses other than Pinned, Pinning, PinQueued, Unpinned or Remote', () => {
      const pins = [
        createPinWithStatus('UnpinQueued'),
        createPinWithStatus('PinError')
      ]
      assert.strictEqual(getEffectivePinStatus(pins), 'failed')
    })
  })

  describe('DELETE /pins/:requestId', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('test-pinning', 'test-pinning')
    })

    it('fails to delete if there is no user token', async () => {
      const res = await fetch(new URL('pins/1', endpoint).toString(), {
        method: 'DELETE'
      })

      assert(res, 'Server responded')
      assert(!res.ok)
      assert.deepEqual(res.status, 401)
    })

    it('returns not found if the request does not exist', async () => {
      const pinThatDoesNotExists = 'idThatDoesNotExists'
      const res = await fetch(new URL(`pins/${pinThatDoesNotExists}`, endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert(res, 'Server responded')
      assert.deepEqual(res.status, 404)
      const { error } = await res.json()
      assert.deepEqual(error.reason, PSAErrorResourceNotFound.CODE)
      assert.deepEqual(error.details, DATA_NOT_FOUND)
    })

    it('deletes the pin request', async () => {
      const cid = 'bafybeifzequu4ial7i4jdw4gxabi5xyx2qeci2o4scc65s2st5o7fsynqu'
      const pinRequest = await createPinRequest(cid, token)

      const r = await fetch(new URL(`pins/${pinRequest.requestid}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert(r.ok, 'It did not create the request in the first place')

      const resD = await fetch(new URL(`pins/${pinRequest.requestid}`, endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert.equal(resD.status, 202, 'Delete request was not successful')

      const res = await fetch(new URL(`pins/${pinRequest.requestid}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert.equal(res.status, 404)
    })

    it('returns the pin request id that has been deleted', async () => {
      const requestId = '5c7e7885-7f68-462d-bdfb-3f0abfb367b5'
      const res = await fetch(new URL(`pins/${requestId}`, endpoint).toString(), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      assert(res.ok, 'Server responded')
      assert.equal(res.status, 202)
    })
  })

  describe('POST /pins/:requestId', () => {
    let token = null
    before(async () => {
      token = await getTestJWT('test-pinning', 'test-pinning')
    })

    it('should not replace a pin request that doesn\'t exist', async () => {
      const res = await fetch(new URL('pins/100', endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid: 'bafybeibqmrg5e5bwhx2ny4kfcjx2mm3ohh2cd4i54wlygquwx7zbgwqs4e'
        })
      })

      assert(res, 'Server responded')
      assert.equal(res.status, 404)
      const { error } = await res.json()
      assert.equal(error.reason, PSAErrorResourceNotFound.CODE)
      assert.equal(error.details, DATA_NOT_FOUND)
    })

    it('should delete the pin request and replace it', async () => {
      // Create a pin request.
      const cid = 'bafybeid3ka3b3f443kv2je3mfm4byk6qps3wipr7wzu5uli6tdo57crcke'
      const pinRequest = await createPinRequest(cid, token)

      // Replace this pin request, and include extra data.
      const newCid = 'bafybeid4f2r3zpnkjqrglkng265ttqg6zbdr75dpbiwellvlpcxq7pggjy'
      const name = 'Replaced.pdf'
      const origins = [
        '/ip4/77.100.8.43/tcp/28253/p2p/12D3KooWGYUY2TCpPZsiaJfqs7V74mbSTgx4xNtBkRzkSGQjdaLp',
        '/ip4/77.100.8.43/udp/28253/quic/p2p/12D3KooWGYUY2TCpPZsiaJfqs7V74mbSTgx4xNtBkRzkSGQjdaLp'
      ]
      const meta = { app_id: '99986338-1113-4706-8302-4420da6158aa' }

      const replaceResponse = await fetch(new URL(`pins/${pinRequest.requestid}`, endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid: newCid,
          name,
          origins,
          meta
        })
      })

      assert(replaceResponse, 'Replace request did not respond')
      assert(replaceResponse.ok, 'Replace request was not successful')
      assert.strictEqual(replaceResponse.status, 202)
      const data = await replaceResponse.json()
      assertCorrectPinResponse(data)
      assert.strictEqual(data.pin.cid, newCid)
      assert.deepStrictEqual(data.pin.name, name)
      assert.deepStrictEqual(data.pin.origins, origins)
      assert.deepStrictEqual(data.pin.meta, meta)

      // Ensure the original pin request has been deleted.
      const getResponse = await fetch(new URL(`pins/${pinRequest.requestid}`, endpoint).toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      assert(getResponse, 'Get request did not respond')
      assert.strictEqual(getResponse.status, 404, 'Pin request was not deleted')
    })

    it('can update existing pin request (with same CID)', async () => {
      const cid = 'bafybeieppxukl4i4acnjcdj2fueoa5oppuaciseggv2cvplj2iu6d7kx2e'
      const aNewName = 'aNewName'
      const pinRequest = await createPinRequest(cid, token)
      const res = await fetch(new URL(`pins/${pinRequest.requestid}`, endpoint).toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cid,
          name: aNewName
        })
      })

      assert(res, 'Server responded')
      assert(res.ok)
      const data = await res.json()
      assertCorrectPinResponse(data)
      assert.strictEqual(data.pin.cid, cid)
      assert.strictEqual(data.pin.name, aNewName)
    })
  })
})
