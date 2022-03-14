import execa from 'execa'
import { dbCmd } from './db.js'
import delay from 'delay'
import { dbSqlCmd } from './db-sql.js'

export async function dbTypesCmd () {
  const project = `web3-storage-pg-rest-api-types-${Date.now()}`
  console.log('Starting DB...')
  await dbCmd({ start: true, project })
  await delay(2000)

  try {
    console.log('Loading schema...')
    await dbSqlCmd({ cargo: true, testing: true })
    await delay(2000) // it takes a moment for postgrest to update
    console.log('Generating types...')
    const url = `${process.env.PG_REST_URL}/?apikey=${process.env.PG_REST_JWT}`
    await execa(
      'openapi-typescript',
      [url, '--output', 'postgres/pg-rest-api-types.d.ts'],
      { preferLocal: true }
    )
  } finally {
    await dbCmd({ clean: true, stop: true, project })
  }
}
