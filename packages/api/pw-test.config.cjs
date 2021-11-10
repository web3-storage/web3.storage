const path = require('path')

module.exports = {
  buildSWConfig: {
    inject: [
      path.join(__dirname, 'test', 'scripts', 'node-globals.js'),
      path.join(__dirname, 'test', 'scripts', 'worker-globals.js')
    ],
    plugins: [{
      name: 'node builtins',
      setup (build) {
        build.onResolve({ filter: /^stream$/ }, () => {
          return { path: require.resolve('stream-browserify') }
        })

        build.onResolve({ filter: /^cross-fetch$/ }, () => {
          return { path: path.resolve(__dirname, 'src', 'utils', 'fetch.js') }
        })
      }
    }]
  }
}
