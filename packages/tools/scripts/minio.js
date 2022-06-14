import { Client as Minio } from 'minio'
import execa from 'execa'
import path from 'path'
import { fileURLToPath } from 'url'
import retry from 'p-retry'
import { isPortReachable } from './util.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const composePath = path.join(__dirname, '../docker/minio/docker-compose.yml')

const MINIO_API_PORT = 9000

const minioConfig = {
  useSSL: false,
  endPoint: '127.0.0.1',
  port: MINIO_API_PORT,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin'
}

/**
 * @param {import('sade').Sade} prog
 */
export function minioCmd (prog) {
  return prog
    .command('minio server start')
    .describe('Start a minio server in a docker container')
    .option('--project', 'Project name', 'minio')
    .action(serverStartCmd)
    .command('minio server stop')
    .describe('Stop a running minio server')
    .option('--project', 'Project name', 'minio')
    .option('--clean', 'Clean up the docker container after stopping', false)
    .action(serverStopCmd)
    .command('minio server clean')
    .describe('Clean up the docker container')
    .option('--project', 'Project name', 'minio')
    .action(serverCleanCmd)
    .command('minio bucket create <name>')
    .describe('Create a new bucket')
    .action(bucketCreateCmd)
    .command('minio bucket remove <name>')
    .describe('Remove a bucket, automatically removing all contents')
    .action(bucketRemoveCmd)
}

/**
 * @param {{ project?: string }} opts
 */
async function serverStartCmd ({ project = 'minio' }) {
  if (await isPortReachable(MINIO_API_PORT)) {
    return console.log('Skipped starting minio. Port 9000 is already in use, so assuming minio is already running.')
  }

  await execa('docker-compose', [
    '--file',
    composePath,
    '--project-name',
    project,
    'up',
    '--detach'
  ], { stdio: 'inherit' })
}

/**
 * @param {{ project?: string }} opts
 */
async function serverStopCmd ({ project = 'minio', clean }) {
  await execa('docker-compose', [
    '--file',
    composePath,
    '--project-name',
    project,
    'stop'
  ], { stdio: 'inherit' })

  if (clean) {
    await serverCleanCmd({ project })
  }
}

/**
 * @param {{ project?: string }} opts
 */
async function serverCleanCmd ({ project = 'minio' }) {
  await execa('docker-compose', [
    '--file',
    composePath,
    '--project-name',
    project,
    'down',
    '--volumes',
    '--rmi',
    'local',
    '--remove-orphans'
  ], { stdio: 'inherit' })
}

/**
 * @param {string} name Bucket name
 */
async function bucketCreateCmd (name) {
  await retry(async () => {
    if (!await isPortReachable(MINIO_API_PORT)) {
      throw new Error(`Minio API not reachable on port: ${MINIO_API_PORT}`)
    }
  }, { retries: 3 })

  const minio = new Minio(minioConfig)

  if (await minio.bucketExists(name)) {
    return console.log(`Cannot create bucket "${name}": already exists`)
  }

  await minio.makeBucket(name, 'us-east-1')
  console.log(`Created bucket "${name}"`)
}

/**
 * @param {string} name Bucket name
 */
async function bucketRemoveCmd (name) {
  const minio = new Minio(minioConfig)

  if (!(await minio.bucketExists(name))) {
    return console.log(`Cannot remove bucket "${name}": not found`)
  }

  const keys = []
  for await (const item of minio.listObjectsV2(name, '', true)) {
    keys.push(item.name)
  }

  if (keys.length) {
    console.log(`Removing ${keys.length} items...`)
    await minio.removeObjects(name, keys)
  }

  await minio.removeBucket(name)
  console.log(`Removed bucket "${name}"`)
}
