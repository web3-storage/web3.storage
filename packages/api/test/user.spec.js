/* eslint-env mocha */
import assert from 'assert'
import fetch from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { getTestJWT, getDBClient } from './scripts/helpers.js'
import userUploads from './fixtures/pgrest/get-user-uploads.js'

describe('GET /user/account', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/account', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/account', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('retrieves user account data', async () => {
    const token = 'test-magic'
    const res = await fetch(new URL('user/account', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const data = await res.json()
    assert.strictEqual(data.usedStorage.uploaded, 32000)
    assert.strictEqual(data.usedStorage.psaPinned, 10000)
  })
})

describe('GET /user/info', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/account', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/account', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('retrieves user account data', async () => {
    const db = getDBClient()
    const token = 'test-magic'
    const user = await db.getUser('test-magic-issuer')
    let res, userInfo

    // Set PSA access to true and check response
    await db.createUserTag(user._id, { tag: 'HasPsaAccess', value: 'true', reason: 'testing' })
    res = await fetch(new URL('user/info', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    userInfo = await res.json()
    assert.strictEqual(userInfo.info._id, user._id)
    assert.strictEqual(userInfo.info.tags.HasPsaAccess, true)

    // Set PSA access to false and check response
    await db.createUserTag(user._id, { tag: 'HasPsaAccess', value: 'false', reason: 'testing' })
    res = await fetch(new URL('user/info', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    userInfo = await res.json()
    assert.strictEqual(userInfo.info._id, user._id)
    assert.strictEqual(userInfo.info.tags.HasPsaAccess, false)
  })
})

describe('GET /user/tokens', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('retrieves user tokens', async () => {
    const token = 'test-magic'
    const res = await fetch(new URL('user/tokens', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const tokens = await res.json()
    assert(Array.isArray(tokens))
    tokens.forEach(t => {
      assert(t._id)
      assert(t.name)
      assert(t.secret)
      assert(t.created)
    })
  })
})

describe('POST /user/tokens', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'test' })
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      body: JSON.stringify({ name: 'test' })
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('creates a new token', async () => {
    const token = 'test-magic'
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'test' })
    })
    assert(res.ok)
    assert.strictEqual(res.status, 201)
    const { _id } = await res.json()
    assert(_id)
  })

  it('requires valid name', async () => {
    const token = 'test-magic'
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: null })
    })
    assert(!res.ok)
    const { message } = await res.json()
    assert.strictEqual(message, 'invalid name')
  })
})

describe('DELETE /user/tokens/:id', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens/2', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens/2', endpoint), {
      method: 'DELETE'
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('removes a token', async () => {
    const token = 'test-magic'
    const res = await fetch(new URL('user/tokens/2', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const data = await res.json()
    assert(data._id)
  })
})

describe('GET /user/uploads', () => {
  it('lists uploads', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, userUploads)
  })

  it('lists uploads sorted by name', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?sortBy=Name', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, [...userUploads].sort((a, b) => b.name.localeCompare(a.name)))
  })

  it('lists uploads via magic auth', async () => {
    const token = 'test-magic'
    const res = await fetch(new URL('/user/uploads', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, userUploads)
  })

  it('paginates', async () => {
    const token = await getTestJWT()
    const size = 1
    const res = await fetch(new URL(`/user/uploads?size=${size}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)

    const expected = [userUploads[0]]
    const link = res.headers.get('Link')
    assert(link, 'has a Link header for the next page')
    assert.strictEqual(link, `</user/uploads?size=${size}&before=${encodeURIComponent(expected[0].created)}>; rel="next"`)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, expected)
  })
})

describe.only('GET /user/upload/:cid', () => {
  it('gets a single upload', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL(`/user/upload/${userUploads[0].cid}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, userUploads[0])
  })

  it('returns 404 when no upload is found', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/upload/010101', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 404)
  })
})

describe('DELETE /user/uploads/:cid', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/uploads/bafybeibq5kfbnbvjgjg6bop4anhhaqopkc7t6mp2v3er3fkcv6ezhgvavg', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/uploads/bafybeibq5kfbnbvjgjg6bop4anhhaqopkc7t6mp2v3er3fkcv6ezhgvavg', endpoint), {
      method: 'DELETE'
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('removes an upload', async () => {
    const token = 'test-magic'
    const res = await fetch(new URL('user/uploads/bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const { _id } = await res.json()
    assert(_id)
  })
})
