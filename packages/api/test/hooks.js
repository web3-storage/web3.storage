import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { Miniflare } from 'miniflare'
import { createFetchMock } from '@miniflare/core'
import execa from 'execa'
import delay from 'delay'
import { webcrypto } from 'crypto'
import * as ed25519 from '@ucanto/principal/ed25519'
import * as workerGlobals from './scripts/worker-globals.js'
import { AuthorizationTestContext } from './contexts/authorization.js'
import { Response } from '@web-std/fetch'
import * as Claims from './scripts/content-claims.js'

if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error webcrypto not a perfect match
  globalThis.crypto = webcrypto
}

// @ts-ignore
globalThis.Response = Response

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
  let claimsService
  /** @type {import('./scripts/content-claims.js').Store} */
  let claimStore
  /** @type {import('http').Server} */
  let srv

  return {
    async beforeAll () {
      this.timeout(120_000)
      AuthorizationTestContext.install(this)
      const fetchMock = createFetchMock()
      const mf = new Miniflare({
        // Autoload configuration from `.env`, `package.json` and `wrangler.toml`
        envPath: true,
        scriptPath: 'dist/worker.js',
        packagePath: true,
        wranglerConfigPath: true,
        wranglerConfigEnv: 'test',
        modules: true,
        bindings: workerGlobals,
        fetchMock
      })
      globalThis.miniflareFetchMock = fetchMock
      globalThis.miniflare = mf

      await Promise.all([
        (async () => {
          console.log('⚡️ Starting Miniflare')
          srv = await mf.startServer()
        })(),
        (async () => {
          console.log('⚡️ Starting Minio')
          projectMinio = `web3-storage-minio-${Date.now()}`
          await execa(toolsCli, ['minio', 'server', 'start', '--project', projectMinio])
        })(),
        (async () => {
          console.log('⚡️ Starting IPFS Cluster')
          projectCluster = `web3-storage-cluster-${Date.now()}`
          await execa(toolsCli, ['cluster', '--start', '--project', projectCluster])
        })(),
        (async () => {
          console.log('⚡️ Starting PostgreSQL and PostgREST')
          projectDb = `web3-storage-db-${Date.now()}`
          await execa(dbCli, ['db', '--start', '--project', projectDb])

          console.log('⚡️ Loading DB schema')
          await execa(dbCli, ['db-sql', '--cargo', '--testing', `--customSqlPath=${initScript}`])
        })(),
        (async () => {
          console.log('⚡️ Starting Content Claims service')
          const signer = ed25519.parse(workerGlobals.CONTENT_CLAIMS_PRIVATE_KEY)
          const port = parseInt(new URL(workerGlobals.CONTENT_CLAIMS_SERVICE_URL).port)
          claimStore = new Claims.Store()
          claimsService = await Claims.createHTTPServer({ signer, claimStore, port })
          globalThis.claimStore = claimStore
        })()
      ])

      await delay(1000)
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
      if (claimsService) {
        console.log('🛑 Stopping Content Claims service')
        claimsService.close()
      }
    },

    async beforeEach () {
      await execa(toolsCli, ['minio', 'bucket', 'remove', 'dotstorage-test-0'])
      await execa(toolsCli, ['minio', 'bucket', 'create', 'dotstorage-test-0'])
      await execa(dbCli, ['db-sql', '--skipCreate', '--truncate', `--customSqlPath=${initScript}`])
      if (claimStore) claimStore.clear()
    }
  }
}

/**
 * create a miniflare instance to run the api cf worker
 */
export function createApiMiniflare ({ initialBindings = workerGlobals, bindings = {}, port = 0 } = {}) {
  return new Miniflare({
    // Autoload configuration from `.env`, `package.json` and `wrangler.toml`
    envPath: true,
    scriptPath: 'dist/worker.js',
    packagePath: true,
    wranglerConfigPath: true,
    wranglerConfigEnv: 'test',
    modules: true,
    port,
    bindings: {
      ...initialBindings,
      ...bindings
    }
  })
}

/**
 * @param {import('http').Server} serverPromise
 * @param {(server: import('http').Server) => Promise<void>} withServerCb
 */
export function useServer (serverPromise, withServerCb) {
  const use = async () => {
    const server = await serverPromise
    try {
      await withServerCb(server)
    } finally {
      await closeServer(server)
    }
  }
  return use()
}

/**
 * @param {import('http').Server} server
 */
export async function closeServer (server) {
  return new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve(undefined))
  })
}

/**
 * @param {import('http').Server} server
 */
export function getServerUrl (server) {
  const address = server.address()
  if (!address) { throw new Error('no address') }
  if (typeof address !== 'object') { throw new Error(`unexpected address type ${address}`) }
  return `http://localhost:${address.port}`
}
