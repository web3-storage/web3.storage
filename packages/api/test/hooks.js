import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { Miniflare } from 'miniflare'
import execa from 'execa'
import delay from 'delay'
import { webcrypto } from 'crypto'
import * as workerGlobals from './scripts/worker-globals.js'

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
  /** @type {string} */
  let projectMinio
  /** @type {import('http').Server} */
  let srv

  return {
    async beforeAll () {
      this.timeout(120_000)

      console.log('⚡️ Starting Miniflare')
      srv = await new Miniflare({
        // Autoload configuration from `.env`, `package.json` and `wrangler.toml`
        envPath: true,
        scriptPath: 'dist/worker.mjs',
        packagePath: true,
        wranglerConfigPath: true,
        wranglerConfigEnv: 'test',
        modules: true,
        bindings: workerGlobals
      }).startServer()

      console.log('⚡️ Starting Minio')
      projectMinio = `web3-storage-minio-${Date.now()}`
      await execa(toolsCli, ['minio', 'server', 'start', '--project', projectMinio])

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
      if (projectMinio) {
        console.log('🛑 Stopping Minio')
        execa(toolsCli, ['minio', 'server', 'stop', '--clean', '--project', projectMinio])
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
      await execa(toolsCli, ['minio', 'bucket', 'remove', 'dotstorage-test-0'])
      await execa(toolsCli, ['minio', 'bucket', 'create', 'dotstorage-test-0'])
      await execa(dbCli, ['db-sql', '--skipCreate', '--truncate', `--customSqlPath=${initScript}`])
    }
  }
}
