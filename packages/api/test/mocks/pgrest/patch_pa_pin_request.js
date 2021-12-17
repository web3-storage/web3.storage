/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {Request} request
 */
module.exports = ({ query }) => {
  const id = query.id && query.id.split('eq.')[1]
  const date = new Date(1, 1, 1)

  if (!id) {
    // Return a list
    const pinRequests = [
      {
        _id: 1,
        contentCid: null,
        sourceCid: 'something',
        authKey: 'something',
        name: 'something',
        created: date.toISOString(),
        updated: date.toISOString(),
        content: {
          cid: 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu',
          dagSize: null,
          pins: [{
            status: 'Pinned',
            updated: date.toISOString(),
            location: {}
          }]
        }
      },
      {
        _id: 2,
        contentCid: null,
        sourceCid: 'something',
        authKey: 'something',
        name: 'something',
        created: date.toISOString(),
        updated: date.toISOString(),
        content: {
          cid: 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu',
          dagSize: null,
          pins: [{
            status: 'Pinned',
            updated: date.toISOString(),
            location: {}
          }]
        }
      },
      {
        _id: 3,
        contentCid: null,
        sourceCid: 'something',
        authKey: 'something',
        name: 'something',
        created: date.toISOString(),
        updated: date.toISOString(),
        content: {
          cid: 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu',
          dagSize: null,
          pins: [{
            status: 'Pinned',
            updated: date.toISOString(),
            location: {}
          }]
        }
      }
    ]
    return {
      statusCode: 200,
      body: JSON.stringify(pinRequests)
    }
  }

  if (id === '1') {
    const pinRequest = {
      _id: id,
      contentCid: null,
      sourceCid: 'something',
      authKey: 'something',
      name: 'something',
      created: date.toISOString(),
      updated: date.toISOString()
    }
    return {
      statusCode: 200,
      body: JSON.stringify(pinRequest)
    }
  }

  if (id === '2') {
    const pinRequest = {
      _id: id,
      contentCid: null,
      sourceCid: 'something',
      authKey: 'something',
      name: 'something',
      created: date.toISOString(),
      updated: date.toISOString(),
      content: {
        cid: 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu',
        dagSize: null,
        pins: [{
          status: 'Pinned',
          updated: date.toISOString(),
          location: {}
        }]
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify(pinRequest)
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      details: 'Results contain 0 rows, application/vnd.pgrst.object+json requires 1 row',
      message: 'JSON object requested, multiple (or no) rows returned'
    })
  }
}
