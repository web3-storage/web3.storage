const path = require('path')
const dotenv = require('dotenv')
const execa = require('execa')

dotenv.config({
  path: path.join(__dirname, '.env.local')
})

const dbCli = path.join(__dirname, '../db/scripts/cli.js')
const initScript = path.join(__dirname, './test/fixtures/init-data.sql')

module.exports = {
  // Setup needed docker containers before running tests
  beforeTests: async () => {
    console.log('⚡️ Starting local postgrest container')

    const project = `web3-storage-db-${Date.now()}`
    await execa(dbCli, ['db', '--start', '--project', project])
    await execa(dbCli, ['db-sql', '--cargo', '--testing', `--customSqlPath=${initScript}`])

    console.log('⚡️ local postgrest container started.')
    return { project }
  },
  // Tear down docker containers
  afterTests: async (ctx, beforeTests) => {
    console.log('⚡️ Stopping local postgrest container.')
    await execa(dbCli, ['db', '--stop', '--clean', '--project', beforeTests.project])
  },
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
