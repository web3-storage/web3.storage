/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {Request} request
 */
module.exports = ({ query }) => {
  const date = new Date()

  const pinRequest = {
    _id: '1',
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
