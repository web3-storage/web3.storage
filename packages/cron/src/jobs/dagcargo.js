import debug from 'debug'

const LIMIT = 1000

const FIND_CONTENT_TO_UPDATE = `
SELECT d.cid_v1 as cid, d.size_actual
  FROM cargo.dag_sources ds
  JOIN cargo.dags d using ( cid_v1 )
  JOIN cargo.sources s USING ( srcid )
WHERE
  d.size_actual IS NOT NULL AND
  (d.size_actual != ds.size_claimed OR ds.size_claimed is NULL) AND 
  ds.entry_last_updated > $1 AND
  ($2::TIMESTAMP IS NULL OR ds.entry_last_updated < $2) AND
  s.project = 1
LIMIT $3
OFFSET $4
`

const UPDATE_CONTENT_DAG_SIZE = `
UPDATE public.content
  SET dag_size = $1,
    updated_at = timezone('utc'::TEXT, NOW())
WHERE cid = $2 AND 
dag_size IS DISTINCT FROM $1
RETURNING cid
`

/**
 * Sets dag_size for content that does not yet have a size.
 *
 * The approach taken in this function has been iterated upon a few times.
 * The current implementation uses a direct connection to cargo, given FDW cross-joins proved to be expensive.
 * Given we can't cross check sizes easily, the current implementation uses a naive approach.
 * We get all the cids, and sizes of dags that originally claimed the wrong dag_size. This implies getting also
 * dags which size has already been updated and fixed.
 *
 * If that's the case, we don't update the size in w3 content.
 *
 * This means we're going through content that shouldn't really be "considered" by the cron, however given this happens in the background
 * and we mostly run this on the latest day content, the implementation should be good enough.
 *
 * @param {Object} config
 * @param {import('pg').Client} config.rwPg
 * @param {import('pg').Pool} config.cargoPool
 * @param {number} [config.limit]
 * @param {Date} config.after
 * @param {Date} [config.before]
 */
export async function updateDagSizes ({ rwPg, cargoPool, after, before, limit = LIMIT }) {
  const log = debug('dagcargo:updateDagSizes')

  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=dagcargo:updateDagSizes')
  }
  const beforeLog = before ? ` and before ${before.toISOString()}` : ''
  log(`🎯 Updating DAG sizes for content inserted after ${after.toISOString()}${beforeLog}.`)

  let updatedCids = 0
  let offset = 0
  while (true) {
    let updatedInBatch = 0
    const { rows: contents } = await cargoPool.query(FIND_CONTENT_TO_UPDATE, [
      after.toISOString(),
      before?.toISOString(),
      limit,
      offset
    ])
    if (!contents.length) break

    /* eslint-disable camelcase */
    for (const { cid, size_actual } of contents) {
      const result = await rwPg.query(UPDATE_CONTENT_DAG_SIZE, [size_actual, cid])

      if (result.rowCount > 0) {
        log(`💪 Succsesfully updated ${cid} dag_size to ${size_actual} bytes`)
        updatedInBatch++
      }
    }

    updatedCids += updatedInBatch
    log(`ℹ️ Updated ${updatedInBatch} in current iteration`)
    offset += limit
  }

  log(`ℹ️ Updated ${updatedCids} in total`)

  log('✅ Done')
}
