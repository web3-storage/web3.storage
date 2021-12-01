/**
 * I teach smoke how to parse `application/car` files sent as the body of a request
 *
 * Usage:
 *  smoke --hooks test/mocks/hoooks.js <your mocks dir>
 *
 * Allows you to curl a CAR at your mock like:
 *  curl -X POST http://localhost:1337/car -H "Content-Type: application/car" --data-binary "@./pics.car"
 *  {"ok":true,"value":{"cid":"bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu","size":195}}
 *
 * see: https://github.com/sinedied/smoke#middleware-hooks
 */
const bodyParser = require('body-parser')
const cors = require('cors')

module.exports = {
  // middlewares to be executed before the request is processed
  before: [
    cors({
      exposedHeaders: 'Link'
    }),
    bodyParser.raw({
      limit: '101MB', // Cloudflare limit is 100MB so larger than that and you're gonna have a bad time anyway.
      type: ['application/car', 'application/octet-stream']
    }),
    bodyParser.text({
      type: ['text/plain']
    })
  ],
  after: [] // middlewares to be executed after the request has been processed
}
