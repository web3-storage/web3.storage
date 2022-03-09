import debug from 'debug'

const COUNT_CONTENT_WITHOUT_SIZE = `
SELECT COUNT(*)
  FROM public.content
 WHERE (dag_size IS NULL OR dag_size = 0)
   AND inserted_at > $1
`

const FIND_CONTENT_WITHOUT_SIZE = `
SELECT cid
  FROM public.content
 WHERE (dag_size IS NULL OR dag_size = 0)
   AND inserted_at > $1
OFFSET $2
 LIMIT $3
`

const FIND_DAG_SIZES = `
SELECT cid_v1,
       size_actual
  FROM cargo.dags
 WHERE size_actual IS NOT NULL
   AND cid_v1 = ANY ($1)
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
 * @param {Date} config.after
 */
export async function updateDagSizes ({ rwPg, roPg, after }) {
  const log = debug('dagcargo:updateDagSizes')
  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=dagcargo:updateDagSizes')
  }

  log(`🎯 Updating DAG sizes for content inserted after ${after.toISOString()}`)

  const countRes = await roPg.query(COUNT_CONTENT_WITHOUT_SIZE, [
    after.toISOString()
  ])
  const total = countRes.rows[0].count
  log(`ℹ️ ${total} records without dag_size`)

  let offset = 0
  const limit = 1000
  while (true) {
    const { rows: contents } = await roPg.query(FIND_CONTENT_WITHOUT_SIZE, [
      after.toISOString(),
      offset,
      limit
    ])
    if (!contents.length) break

    const cids = contents.map((c) => c.cid)
    const { rows: sizes } = await roPg.query(FIND_DAG_SIZES, [cids])

    /* eslint-disable camelcase */
    for (const { cid_v1, size_actual } of sizes) {
      log(`💪 ${cid_v1} ${size_actual} bytes`)
      await rwPg.query(UPDATE_CONTENT_DAG_SIZE, [size_actual, cid_v1])
    }
    /* eslint-enable camelcase */

    log(`ℹ️ ${offset + contents.length} of ${total} processed in total`)
    offset += limit
  }

  log('✅ Done')
}
