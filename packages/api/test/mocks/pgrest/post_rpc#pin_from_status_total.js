/**
 * https://github.com/sinedied/smoke#javascript-mocks
 */
module.exports = () => {
  return {
    statusCode: 200,
    body: [{
      pin_from_status_total: '30000'
    }]
  }
}
