/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {Request} request
 */
module.exports = ({ query }) => {
  const id = query.id && query.id.split('eq.')[1]

  const date = new Date(1, 1, 1)
  if (id === '1') {
    const pinRequest = {
      _id: parseInt(id, 10),
      contentCid: null,
      requestedCid: 'something',
      authKey: 'something',
      name: 'something',
      deleted: null,
      created: date.toISOString(),
      updated: date.toISOString()
    }
    return {
      statusCode: 200,
      id: pinRequest._id
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
