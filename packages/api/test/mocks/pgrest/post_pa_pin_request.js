/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {Request} request
 */
module.exports = ({ query }) => {
  const id = query.id && query.id.split('eq.')[1]
  // TODO : change this for actual tests

  const date = new Date(1, 1, 1)

  const pinRequest = {
    _id: `${id}`,
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
    body: JSON.stringify(pinRequest)
  }
}
