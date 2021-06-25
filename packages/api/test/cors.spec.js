import assert from 'assert'

const endpoint = 'http://testing.filecoin.storage'

describe('CORS', () => {
  it('sets CORS headers for OPTIONS request', async () => {
    const res = await fetch(endpoint, { method: 'OPTIONS' })
    console.log(res.status)
    assert(res.ok)
  })
})
