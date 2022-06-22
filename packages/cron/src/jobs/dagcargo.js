import debug from 'debug'

const LIMIT = 1000

const FIND_CONTENT_TO_UPDATE = `
SELECT d.cid_v1 as cid, d.size_actual
  FROM cargo.dag_sources ds
  JOIN cargo.dags d using ( cid_v1 )
  JOIN cargo.sources s USING ( srcid )
WHERE
  d.size_actual > 0 AND 
  d.size_actual != ds.size_claimed AND 
  ds.entry_last_updated > $1 AND
  s.project = 1
LIMIT $2
OFFSET $3
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
  let offset = 0
  while (true) {
    const { rows: contents } = await roPg.query(FIND_CONTENT_TO_UPDATE, [
      after.toISOString(),
      limit,
      offset
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
    offset += limit
  }

  log(`ℹ️ Updated ${updatedCids} in total`)

  log('✅ Done')
}
