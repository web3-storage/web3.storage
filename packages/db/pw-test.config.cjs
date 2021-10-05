const path = require('path')
const dotenv = require('dotenv')
const execa = require('execa')

dotenv.config({
  path: path.join(__dirname, '.env.local')
})

const cli = path.join(__dirname, 'scripts/cli.js')

module.exports = {
  // Setup needed docker containers before running tests
  beforeTests: async () => {
    const project = `web3-storage-db-${Date.now()}`
    await execa(cli, ['db', '--start', '--project', project])
    await execa(cli, ['db-sql', '--cargo', '--testing'])

    console.log('⚡️ Mock postgres started.')
    return { project }
  },
  // Tear down docker containers
  afterTests: async (ctx, beforeTests) => {
    console.log('⚡️ Shutting down mock server.')
    await execa(cli, ['db', '--stop', '--clean', '--project', beforeTests.project])
  }
}
