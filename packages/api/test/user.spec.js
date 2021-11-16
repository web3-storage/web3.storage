/* eslint-env mocha, browser */
import assert from 'assert'
import { endpoint } from './scripts/constants.js'
import { getTestJWT } from './scripts/helpers.js'

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
    assert(data.usedStorage)
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
    const res = await fetch(new URL('user/tokens/xyz', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens/xyz', endpoint), {
      method: 'DELETE'
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('removes a token', async () => {
    const token = 'test-magic'
    const res = await fetch(new URL('user/tokens/xyz', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const { _id } = await res.json()
    assert(_id)
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
    // TODO: import from fixture
    const expected = [
      {
        name: 'Upload at 2021-07-09T16:20:32.658Z',
        cid: 'bafkreigpimx5kl6thyfysh2witvbo5nexvu3q3uc3y65rj5sr5czcc7wae',
        dagSize: null,
        created: '2021-07-09T16:20:33.946845Z',
        deals: [],
        pins: []
      },
      {
        name: 'week-in-web3-2021-07-02.mov',
        cid: 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu',
        dagSize: null,
        created: '2021-07-09T10:40:35.408884Z',
        deals: [],
        pins: []
      },
      {
        name: 'pinpie.jpg',
        cid: 'bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa',
        dagSize: null,
        created: '2021-07-09T10:36:05.862862Z',
        deals: [],
        pins: []
      }
    ]
    assert.deepStrictEqual(uploads, expected)
  })

  it('lists uploads sorted by name', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?sortBy=Name', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    // TODO: import from fixture
    const expected = [
      {
        name: 'pinpie.jpg',
        cid: 'bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa',
        dagSize: null,
        created: '2021-07-09T10:36:05.862862Z',
        deals: [],
        pins: []
      },
      {
        name: 'Upload at 2021-07-09T16:20:32.658Z',
        cid: 'bafkreigpimx5kl6thyfysh2witvbo5nexvu3q3uc3y65rj5sr5czcc7wae',
        dagSize: null,
        created: '2021-07-09T16:20:33.946845Z',
        deals: [],
        pins: []
      },
      {
        name: 'week-in-web3-2021-07-02.mov',
        cid: 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu',
        dagSize: null,
        created: '2021-07-09T10:40:35.408884Z',
        deals: [],
        pins: []
      }
    ]
    assert.deepStrictEqual(uploads, expected)
  })

  it('lists uploads via magic auth', async () => {
    const token = 'test-magic'
    const res = await fetch(new URL('/user/uploads', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    // TODO: import from fixture
    const expected = [
      {
        name: 'Upload at 2021-07-09T16:20:32.658Z',
        cid: 'bafkreigpimx5kl6thyfysh2witvbo5nexvu3q3uc3y65rj5sr5czcc7wae',
        dagSize: null,
        created: '2021-07-09T16:20:33.946845Z',
        deals: [],
        pins: []
      },
      {
        name: 'week-in-web3-2021-07-02.mov',
        cid: 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu',
        dagSize: null,
        created: '2021-07-09T10:40:35.408884Z',
        deals: [],
        pins: []
      },
      {
        name: 'pinpie.jpg',
        cid: 'bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa',
        dagSize: null,
        created: '2021-07-09T10:36:05.862862Z',
        deals: [],
        pins: []
      }
    ]
    assert.deepStrictEqual(uploads, expected)
  })

  it('paginates', async () => {
    const token = await getTestJWT()
    const size = 1
    const res = await fetch(new URL(`/user/uploads?size=${size}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    // TODO: import from fixture
    const expected = [
      {
        name: 'Upload at 2021-07-09T16:20:32.658Z',
        cid: 'bafkreigpimx5kl6thyfysh2witvbo5nexvu3q3uc3y65rj5sr5czcc7wae',
        dagSize: null,
        created: '2021-07-09T16:20:33.946845Z',
        deals: [],
        pins: []
      }
    ]
    const link = res.headers.get('Link')
    assert(link, 'has a Link header for the next page')
    assert.strictEqual(link, `</user/uploads?size=${size}&before=${expected[0].created}>; rel="next"`)
    const uploads = await res.json()
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
    const res = await fetch(new URL('user/uploads/bafybeibq5kfbnbvjgjg6bop4anhhaqopkc7t6mp2v3er3fkcv6ezhgvavg', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const { _id } = await res.json()
    assert(_id)
  })
})
