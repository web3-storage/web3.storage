import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import execa from 'execa'
import delay from 'delay'
import { webcrypto } from 'crypto'

global.crypto = webcrypto

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') })

const dbCli = path.join(__dirname, '..', 'scripts', 'cli.js')
const initScript = path.join(__dirname, 'fixtures', 'init-data.sql')

export const mochaHooks = () => {
  /** @type {string} */
  let projectDb

  return {
    async beforeAll () {
      this.timeout(2 * 60_000)

      console.log('⚡️ Starting PostgreSQL and PostgREST')
      projectDb = `web3-storage-db-${Date.now()}`
      await execa(dbCli, ['db', '--start', '--project', projectDb])

      console.log('⚡️ Loading DB schema')
      await execa(dbCli, ['db-sql', '--cargo', '--testing', `--customSqlPath=${initScript}`])

      await delay(2000)
      console.log('⚡️ DB ready')
    },
    async afterAll () {
      this.timeout(60_000)
      if (projectDb) {
        console.log('🟡 Stopping PostgreSQL and PostgREST')
        await execa(dbCli, ['db', '--stop', '--clean', '--project', projectDb])
        console.log('🛑 Stopped PostgreSQL and PostgREST')
      }
    },

    async beforeEach () {
      await execa(dbCli, ['db-sql', '--skipCreate', '--truncate', `--customSqlPath=${initScript}`])
    }
  }
}
