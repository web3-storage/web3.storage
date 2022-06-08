import debug from 'debug'

const LIMIT = 1000

const FIND_CONTENT_TO_UPDATE = `
SELECT c.cid, d.size_actual
FROM public.content c
JOIN cargo.dags d ON c.cid = d.cid_v1
WHERE
  d.size_actual > 0 AND 
  c.dag_size != d.size_actual AND 
  c.inserted_at > $1
LIMIT $2
`

const UPDATE_CONTENT_DAG_SIZE = `
UPDATE public.content
   SET dag_size = $1,
       updated_at = timezone('utc'::TEXT, NOW())
 WHERE cid = $2
`

/**
 * Sets dag_size for content that does not yet have a size.
 *
 * @param {Object} config
 * @param {import('pg').Client} config.rwPg
 * @param {import('pg').Client} config.roPg
 * @param {number} [config.limit]
 * @param {Date} config.after
 */
export async function updateDagSizes ({ rwPg, roPg, after, limit = LIMIT }) {
  const log = debug('dagcargo:updateDagSizes')

  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=dagcargo:updateDagSizes')
  }

  log(`🎯 Updating DAG sizes for content inserted after ${after.toISOString()}`)

  let updatedCids = 0
  while (true) {
    const { rows: contents } = await roPg.query(FIND_CONTENT_TO_UPDATE, [
      after.toISOString(),
      limit
    ])
    if (!contents.length) break

    /* eslint-disable camelcase */
    for (const { cid, size_actual } of contents) {
      log(`💪 ${cid} ${size_actual} bytes`)
      await rwPg.query(UPDATE_CONTENT_DAG_SIZE, [size_actual, cid])
    }
    /* eslint-enable camelcase */

    updatedCids += contents.length
    log(`ℹ️ Updated ${contents.length} in current iteration`)
  }

  log(`ℹ️ Updated ${updatedCids} in total`)

  log('✅ Done')
}
