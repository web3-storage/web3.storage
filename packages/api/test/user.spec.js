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

  it('lists uploads sorted by date', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?sortBy=Date', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, [...userUploads].sort((a, b) => b.created.localeCompare(a.created)))
  })

  it('lists uploads in reverse order when sorting by Asc', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?sortBy=Name&sortOrder=Asc', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    assert(res.ok)

    const uploads = await res.json()
    const sortedUploads = [...userUploads].sort((a, b) => a.name.localeCompare(b.name))

    assert.deepStrictEqual(uploads, sortedUploads)
  })

  it('filters results by before date', async () => {
    const token = await getTestJWT()

    const beforeFilterDate = new Date('2021-07-10T00:00:00.000000+00:00').toISOString()
    const res = await fetch(new URL(`/user/uploads?before=${beforeFilterDate}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    assert(res.ok)

    const uploads = await res.json()

    assert(uploads.length < userUploads.length, 'Ensure some results are filtered out.')
    assert(uploads.length > 0, 'Ensure some results are returned.')

    // Filter uploads fixture by the filter date.
    const uploadsBeforeFilterDate = userUploads.filter((upload) => {
      return upload.created <= beforeFilterDate
    })

    assert.deepStrictEqual(uploads, [...uploadsBeforeFilterDate])
  })

  it('filters results by after date', async () => {
    const token = await getTestJWT()

    const afterFilterDate = new Date('2021-07-10T00:00:00.000000+00:00').toISOString()
    const res = await fetch(new URL(`/user/uploads?after=${afterFilterDate}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    assert(res.ok)

    const uploads = await res.json()

    assert(uploads.length < userUploads.length, 'Ensure some results are filtered out.')
    assert(uploads.length > 0, 'Ensure some results are returned.')

    // Filter uploads fixture by the filter date.
    const uploadsAfterFilterDate = userUploads.filter((upload) => {
      return upload.created >= afterFilterDate
    })

    assert.deepStrictEqual(uploads, [...uploadsAfterFilterDate])
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

  it('paginates by page', async () => {
    const token = await getTestJWT()
    const size = 1
    const page = 2
    const res = await fetch(new URL(`/user/uploads?size=${size}&page=${page}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)

    // Ensure we have all pagination metadata in the headers.
    const link = res.headers.get('link')
    assert(link, 'has a link header for the next page')
    assert.strictEqual(link, `</user/uploads?size=${size}&page=${page - 1}>; rel="previous", </user/uploads?size=${size}&page=${page + 1}>; rel="next"`)

    const resCount = res.headers.get('Count')
    assert.strictEqual(parseInt(resCount), userUploads.length, 'has a count for calculating page numbers')

    const resSize = res.headers.get('Size')
    assert.strictEqual(parseInt(resSize), size, 'has a size for calculating page numbers')

    const resPage = res.headers.get('Page')
    assert.strictEqual(parseInt(resPage), page, 'has a page number for calculating page numbers')

    // Should get second result (page 2).
    const uploads = await res.json()
    const expected = [userUploads[1]]
    assert.deepStrictEqual(uploads, expected)
  })

  it('does not paginate when all results are returned', async () => {
    const token = await getTestJWT()
    const size = 1000
    const res = await fetch(new URL(`/user/uploads?size=${size}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)

    const uploads = await res.json()
    const expected = userUploads
    assert.deepStrictEqual(uploads, expected)
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
