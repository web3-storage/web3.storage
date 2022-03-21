import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import execa from 'execa'
import delay from 'delay'
import { webcrypto } from 'crypto'

global.crypto = webcrypto

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') })

const toolsCli = path.join(__dirname, '..', '..', 'tools', 'scripts', 'cli.js')
const dbCli = path.join(__dirname, '..', '..', 'db', 'scripts', 'cli.js')
const initScript = path.join(__dirname, 'fixtures', 'init-data.sql')

export const mochaHooks = () => {
  /** @type {string} */
  let projectDb
  /** @type {string} */
  let projectCluster
  /** @type {import('http').Server} */
  let srv

  return {
    async beforeAll () {
      this.timeout(60_000)

      console.log('⚡️ Starting IPFS Cluster')
      projectCluster = `web3-storage-cluster-${Date.now()}`
      await execa(toolsCli, ['cluster', '--start', '--project', projectCluster])

      console.log('⚡️ Starting PostgreSQL and PostgREST')
      projectDb = `web3-storage-db-${Date.now()}`
      await execa(dbCli, ['db', '--start', '--project', projectDb])

      console.log('⚡️ Loading DB schema')
      await execa(dbCli, ['db-sql', '--cargo', '--testing', `--customSqlPath=${initScript}`])

      await delay(2000)
    },
    async afterAll () {
      // Note: not awaiting promises here so we see the test results overview sooner.
      this.timeout(60_000)
      if (srv) {
        console.log('🛑 Stopping Miniflare')
        srv.close()
      }
      if (projectCluster) {
        console.log('🛑 Stopping IPFS Cluster')
        execa(toolsCli, ['cluster', '--stop', '--clean', '--project', projectCluster])
      }
      if (projectDb) {
        console.log('🛑 Stopping PostgreSQL and PostgREST')
        execa(dbCli, ['db', '--stop', '--clean', '--project', projectDb])
      }
    },
    async beforeEach () {
      await execa(dbCli, ['db-sql', '--skipCreate', '--truncate', `--customSqlPath=${initScript}`])
    }
  }
}
