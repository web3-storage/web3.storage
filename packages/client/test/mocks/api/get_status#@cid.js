module.exports = ({ params }) => {
  const { cid } = params
  if (cid === 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e') {
    return {
      statusCode: 200,
      body: require('../../fixtures/status.json')
    }
  }
  if (cid === 'error') {
    return {
      statusCode: 500,
      body: { message: 'Server Error' }
    }
  }
  return {
    statusCode: 404,
    body: { message: 'Not Found' }
  }
}
