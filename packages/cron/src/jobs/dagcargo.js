import debug from 'debug'

/**
 *
 * @param {object} options
 * @param {import('@web3-storage/db').DBClient} options.dbClient
 * @param {Date} options.after
 */
export async function updateDagSizes ({ dbClient, after }) {
  const log = debug('dagcargo:updateDagSizes')
  let totalUpdated = 0

  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=dagcargo:updateDagSizes')
  }

  log(`🎯 Updating DAG sizes for content inserted after ${after.toISOString()}`)

  while (true) {
    const updatedCids = await dbClient.updateDagSize({
      from: after
    })

    totalUpdated += updatedCids.length

    log(`ℹ️ Updated the dag size of the following cids ${updatedCids.join(', ')}`)

    if (updatedCids.length === 0) {
      break
    }
  }

  log(`ℹ️ Updated ${totalUpdated} records without or with an incorrect dag_size`)
  log('✅ Done')
}
