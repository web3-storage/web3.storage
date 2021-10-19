const userUploads = [
  {
    name: 'Upload at 2021-07-09T16:20:32.658Z',
    content: {
      cid: 'bafkreigpimx5kl6thyfysh2witvbo5nexvu3q3uc3y65rj5sr5czcc7wae',
      dagSize: null,
      pins: []
    },
    created: '2021-07-09T16:20:33.946845Z'
  },
  {
    name: 'week-in-web3-2021-07-02.mov',
    content: {
      cid: 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu',
      dagSize: null,
      pins: []
    },
    created: '2021-07-09T10:40:35.408884Z'
  },
  {
    name: 'pinpie.jpg',
    content: {
      cid: 'bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa',
      dagSize: null,
      pins: []
    },
    created: '2021-07-09T10:36:05.862862Z'
  }
]

function compareNameDesc (a, b) {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1
  }
  if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1
  }
  return 0
}

/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {Request} request
 */
module.exports = ({ query }) => {
  const [sortBy, sortOrder] = query.order.split('.') // inserted_at
  let sortedUploads = userUploads
  if (sortBy === 'name' && sortOrder === 'desc') {
    sortedUploads = userUploads.sort(compareNameDesc)
  }

  const a = sortedUploads.slice(0, query.limit)
  return a
}
