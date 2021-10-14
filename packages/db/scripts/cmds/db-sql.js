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
 */
export async function dbSqlCmd ({ reset, cargo, testing } = {}) {
  // read all the SQL files
  const tablesSql = fs.readFileSync(path.join(__dirname, '../../postgres/tables.sql'), {
    encoding: 'utf-8'
  })
  const functionsSql = fs.readFileSync(path.join(__dirname, '../../postgres/functions.sql'), {
    encoding: 'utf-8'
  })
  const resetSql = fs.readFileSync(path.join(__dirname, '../../postgres/reset.sql'), {
    encoding: 'utf-8'
  })
  let cargoSql = fs.readFileSync(path.join(__dirname, '../../postgres/cargo.sql'), {
    encoding: 'utf-8'
  })

  let fdwSql = fs.readFileSync(path.join(__dirname, '../../postgres/fdw.sql'), {
    encoding: 'utf-8'
  })

  // Replace secrets in the FDW sql file
  fdwSql = fdwSql.replace(":'DAG_CARGO_HOST'", `'${process.env.DAG_CARGO_HOST}'`)
  fdwSql = fdwSql.replace(":'DAG_CARGO_DATABASE'", `'${process.env.DAG_CARGO_DATABASE}'`)
  fdwSql = fdwSql.replace(":'DAG_CARGO_USER'", `'${process.env.DAG_CARGO_USER}'`)
  fdwSql = fdwSql.replace(":'DAG_CARGO_PASSWORD'", `'${process.env.DAG_CARGO_PASSWORD}'`)

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

  await client.query(tablesSql)

  if (cargo) {
    if (testing) {
      cargoSql = cargoSql.replace(
        `
-- Create materialized view from cargo "aggregate_entries" table
CREATE MATERIALIZED VIEW public.aggregate_entry
AS
SELECT *
FROM cargo.aggregate_entries;`,
        `
CREATE MATERIALIZED VIEW public.aggregate_entry
AS
SELECT *
FROM cargo.aggregate_entries 
WHERE cid_v1 in ('bafybeiaj5yqocsg5cxsuhtvclnh4ulmrgsmnfbhbrfxrc3u2kkh35mts4e');
`
      )
    }

    await client.query(fdwSql)
    await client.query(cargoSql)
  }

  await client.query(functionsSql)
  await client.end()
}
