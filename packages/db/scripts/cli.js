#!/usr/bin/env node
import path from 'path'
import dotenv from 'dotenv'
import sade from 'sade'
import { fileURLToPath } from 'url'
import { dbCmd } from './cmds/db.js'
import { dbSqlCmd } from './cmds/db-sql.js'
import { dbTypesCmd } from './cmds/pg-rest-api-types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prog = sade('api')

dotenv.config({
  path: path.join(__dirname, '../.env.local')
})

prog
  .command('db-sql')
  .describe('Database scripts')
  .option('--reset', 'Reset db before running SQL.', false)
  .option('--cargo', 'Import cargo data.', false)
  .option('--testing', 'Tweak schema for testing.', false)
  .action(dbSqlCmd)
  .command('db')
  .describe('Run docker compose to setup pg and pgrest')
  .option('--init', 'Init docker container', false)
  .option('--start', 'Start docker container', false)
  .option('--stop', 'Stop docker container', false)
  .option('--project', 'Project name', 'nft-storage')
  .option('--clean', 'Clean all dockers artifacts', false)
  .action(dbCmd)
  .command('pg-rest-api-types')
  .describe('Database openapi types')
  .action(dbTypesCmd)

prog.parse(process.argv)
