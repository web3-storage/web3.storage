import debug from 'debug'

const BATCH_SIZE = 1_000_000

const DELETE_QUERY = `
  DELETE FROM pin 
  WHERE id IN 
  (SELECT id FROM pin WHERE status='Remote' LIMIT $1)
  RETURNING id;
`

const log = debug('pins:deleteRemotePins')

/**
 * It deletes "Remote" pins in batches
 *
 * Rationale behind going for a cron job instead of a data migration).
 * 1. avoid to match strain on the DB a single operation on several thousands millions of
 * rows might be holding quite a lot of stuff in memory*.
 * 2. cron can be easily run once deployed and does not require db write access.
 * 3. it can easily be run again if any other Remote pins happen to slip in.
 *
 * @param {object} config
 * @param {import('pg').Pool} config.rwPgPool
 * @param {number} [config.batchSize]
 */
export async function deleteRemotePins ({ rwPgPool, batchSize = BATCH_SIZE }) {
  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=pins:deleteRemotePins')
  }
  let totalDeleted = 0

  while (true) {
    const result = await rwPgPool.query(DELETE_QUERY, [batchSize])
    log(`💪 Succsesfully deleted ${result.rowCount} Remote pins in the current batch`)

    if (result.rowCount === 0) {
      break
    }
    totalDeleted += result.rowCount
  }
  log(`✅ Done. The Job succsesfully deleted ${totalDeleted} Remote pins in total.`)
}
