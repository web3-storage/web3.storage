const path = require('path')
const dotenv = require('dotenv')
const execa = require('execa')

dotenv.config({
  path: path.join(__dirname, '.env.local')
})

const toolsCli = path.join(__dirname, '../tools/scripts/cli.js')
const dbCli = path.join(__dirname, '../db/scripts/cli.js')
const initScript = path.join(__dirname, './test/fixtures/init-data.sql')

module.exports = {
  // Setup needed docker containers before running tests
  beforeTests: async () => {
    console.log('⚡️ Starting local postgrest container')
    const projectDb = `web3-storage-db-${Date.now()}`
    await execa(dbCli, ['db', '--start', '--project', projectDb])
    await execa(dbCli, ['db-sql', '--cargo', '--testing', `--customSqlPath=${initScript}`])
    console.log('⚡️ local postgrest container started.')

    console.log('⚡️ Starting local ipfs-cluster container')
    const projectCluster = `web3-storage-cluster-${Date.now()}`
    await execa(toolsCli, ['cluster', '--start', '--project', projectCluster])
    console.log('⚡️ local ipfs-cluster container started.')

    return { projectDb, projectCluster }
  },
  // Tear down docker containers
  afterTests: async (ctx, beforeTests) => {
    console.log('⚡️ Stopping local postgrest container.')
    await execa(dbCli, ['db', '--stop', '--clean', '--project', beforeTests.projectDb])
    console.log('⚡️ Stopping local ipfs-cluster container.')
    await execa(toolsCli, ['cluster', '--stop', '--clean', '--project', beforeTests.projectCluster])
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
