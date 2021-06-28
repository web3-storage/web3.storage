const path = require('path')

module.exports = {
  buildSWConfig: {
    inject: [path.join(__dirname, 'test', 'scripts', 'worker-globals.js')]
  }
}
