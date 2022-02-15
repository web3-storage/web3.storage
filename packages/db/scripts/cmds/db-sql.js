/**
 * Script with options to perform the typical DB commands.
 */

import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import retry from 'p-retry'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { Client } = pg

/**
 * @param {Object} [opts]
 * @param {boolean} [opts.reset]
 * @param {boolean} [opts.cargo]
 * @param {boolean} [opts.testing]
 * @param {string} [opts.customSqlPath]
 */
export async function dbSqlCmd ({ reset, cargo, testing, customSqlPath } = {}) {
  // read all the SQL files
  const configSql = fs.readFileSync(path.join(__dirname, '../../postgres/config.sql'), 'utf-8')

  const tablesSql = fs.readFileSync(path.join(__dirname, '../../postgres/tables.sql'), 'utf-8')
  const functionsSql = fs.readFileSync(path.join(__dirname, '../../postgres/functions.sql'), 'utf-8')
  const resetSql = fs.readFileSync(path.join(__dirname, '../../postgres/reset.sql'), 'utf-8')
  const cargoSql = fs.readFileSync(path.join(__dirname, '../../postgres/cargo.sql'), 'utf-8')
  const cargoTesting = fs.readFileSync(path.join(__dirname, '../../postgres/cargo.testing.sql'), 'utf-8')
  let fdwSql = fs.readFileSync(path.join(__dirname, '../../postgres/fdw.sql'), 'utf-8')
  // Ready custom
  const customSql = customSqlPath ? fs.readFileSync(customSqlPath, 'utf-8') : undefined

  // Setup postgres client
  const connectionString = process.env.PG_CONNECTION
  const client = await retry(
    async () => {
      const c = new Client({ connectionString })
      await c.connect()
      return c
    },
    { minTimeout: 100 }
  )

  if (reset) {
    await client.query(resetSql)
  }

  await client.query(configSql)
  await client.query(tablesSql)

  // if testing or cargo fdw flag not set, you just get the schema, no fdw connection to dagcargo
  if (testing && cargo) {
    await client.query(cargoTesting)
  } else if (!testing && cargo) {
    // Replace secrets in the FDW sql file
    fdwSql = fdwSql.replace(":'DAG_CARGO_HOST'", `'${process.env.DAG_CARGO_HOST}'`)
    fdwSql = fdwSql.replace(":'DAG_CARGO_DATABASE'", `'${process.env.DAG_CARGO_DATABASE}'`)
    fdwSql = fdwSql.replaceAll(":'DAG_CARGO_USER'", `'${process.env.DAG_CARGO_USER}'`)
    fdwSql = fdwSql.replaceAll(":'DAG_CARGO_PASSWORD'", `'${process.env.DAG_CARGO_PASSWORD}'`)
    fdwSql = fdwSql.replaceAll(':WEB3_STORAGE_USER', `${process.env.WEB3_STORAGE_USER || 'CURRENT_USER'}`)
    await client.query(fdwSql)
    await client.query(cargoSql)
  }

  await client.query(functionsSql)
  customSql && await client.query(customSql)
  await client.end()
}
