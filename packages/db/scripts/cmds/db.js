/**
 * Script with options to init, start, stop and clean a docker compose
 * with a Posgres DB and postgrest.
 */

import path from 'path'
import { fileURLToPath } from 'url'
import execa from 'execa'
import net from 'net'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * @param {Object} opts
 * @param {string} opts.project
 * @param {boolean} [opts.init]
 * @param {boolean} [opts.start]
 * @param {boolean} [opts.stop]
 * @param {boolean} [opts.clean]
 */
export async function dbCmd ({ project, init, start, stop, clean }) {
  const composePath = path.join(__dirname, '../../postgres/docker/docker-compose.yml')

  if (!project) {
    throw new Error('A project must be provided as parameter')
  }

  if (init) {
    await execa('docker-compose', [
      '--file',
      composePath,
      'build',
      '--no-cache'
    ])

    await execa('docker-compose', [
      '--file',
      composePath,
      '--project-name',
      project,
      'up',
      '--build',
      '--no-start',
      '--renew-anon-volumes'
    ])
  }

  if (start) {
    const pgPort = await isPortReachable(5432)
    const pgRestPort = await isPortReachable(3000)
    if (pgPort && pgRestPort) {
      console.log('Skipped starting Postgres. Ports 5432 & 3000 already in use, so assuming already running.')
    } else if (pgRestPort && !pgPort) {
      throw new Error('Failed to start postgres & postgREST. There is a process on port 3000')
    } else if (!pgRestPort && pgPort) {
      throw new Error('Failed to start postgres & postgREST. There is a process on port 5432.')
    } else {
      await execa('docker-compose', [
        '--file',
        composePath,
        '--project-name',
        project,
        'up',
        '--detach'
      ])
    }
  }

  if (stop) {
    await execa('docker-compose', [
      '--file',
      composePath,
      '--project-name',
      project,
      'stop'
    ])
  }

  if (clean) {
    await execa('docker-compose', [
      '--file',
      composePath,
      '--project-name',
      project,
      'down',
      '--rmi',
      'local',
      '-v',
      '--remove-orphans'
    ])
  }
}

/**
 * @param {number} port
 */
export default async function isPortReachable (
  port,
  { host = 'localhost', timeout = 1000 } = {}
) {
  if (typeof host !== 'string') {
    throw new TypeError('Specify a `host`')
  }

  const promise = new Promise((resolve, reject) => {
    const socket = new net.Socket()

    const onError = (err) => {
      socket.destroy()
      reject(err)
    }

    socket.setTimeout(timeout)
    socket.once('error', onError)
    socket.once('timeout', onError)

    socket.connect(port, host, () => {
      socket.end()
      resolve(undefined)
    })
  })

  try {
    await promise
    return true
  } catch {
    return false
  }
}
