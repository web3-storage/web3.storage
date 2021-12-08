#!/usr/bin/env node
import path from 'path'
import dotenv from 'dotenv'
import sade from 'sade'
import { fileURLToPath } from 'url'
import execa from 'execa'


const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prog = sade('api')

dotenv.config({
  path: path.join(__dirname, '../.env.local')
})

prog
  .command('cluster')
  .describe('Run ipfs cluster')
  .option('--start', 'Start docker container', false)
  .option('--stop', 'Stop docker container', false)
  .option('--project', 'Project name', 'ipfs-cluster')
  .option('--clean', 'Clean all dockers artifacts', false)
  .action(clusterCmd)

/**
 * @param {Object} opts
 * @param {string} opts.project
 * @param {boolean} [opts.start]
 * @param {boolean} [opts.stop]
 * @param {boolean} [opts.clean]
 */
 export async function clusterCmd ({ project, start, stop, clean }) {
    const composePath = path.join(__dirname, '../docker/cluster/docker-compose.yml')

    if (!project) {
        throw new Error('A project must be provided as parameter')
    }

    if (start) {
      await execa('docker-compose', [
        '--file',
        composePath,
        '--project-name',
        project,
        'up',
        '--detach'
      ])
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
      console.log(`cleaaning ${composePath}, ${project},`)
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
      ])
    }

}
 
prog.parse(process.argv)
