//https://github.com/sinedied/smoke#middleware-hooks
const bodyParser = require('body-parser')

module.exports = {
  // middlewares to be executed before the request is processed
  before: [
    bodyParser.raw({
      limit: '101MB',
      type: ['application/car', 'application/octet-stream'],
    }),
  ],
  after: [], // middlewares to be executed after the request has been processed
}
