import { gql } from '@web3-storage/db'
import retry from 'p-retry'

const EPOCH = '2021-07-01T00:00:00.000Z'

const COUNT_USERS = gql`
  query CountUsers($from: Time!, $to: Time!, $after: String) {
    countUsers(from: $from, to: $to, _size: 80000, _cursor: $after) {
      data,
      after
    }
  }
`

const COUNT_UPLOADS = gql`
  query CountUploads($from: Time!, $to: Time!, $after: String) {
    countUploads(from: $from, to: $to, _size: 80000, _cursor: $after) {
      data,
      after
    }
  }
`

const COUNT_CIDS = gql`
  query countContent($from: Time!, $to: Time!, $after: String) {
    countContent(from: $from, to: $to, _size: 80000, _cursor: $after) {
      data,
      after
    }
  }
`

const COUNT_PINS = gql`
  query CountPins($from: Time!, $to: Time!, $after: String) {
    countPins(from: $from, to: $to, _size: 80000, _cursor: $after) {
      data,
      after
    }
  }
`

const COUNT_PINS_BY_STATUS = gql`
  query CountPinsByStatus($status: PinStatus!, $from: Time!, $to: Time!, $after: String) {
    countPinsByStatus(status: $status, from: $from, to: $to, _size: 80000, _cursor: $after) {
      data,
      after
    }
  }
`

const SUM_PIN_DAG_SIZE = gql`
  query SumPinDagSize($from: Time!, $to: Time!, $after: String) {
    sumPinDagSize(from: $from, to: $to, _size: 25000, _cursor: $after) {
      data
      after
    }
  }
`

const SUM_CONTENT_DAG_SIZE = gql`
  query SumContentDagSize($from: Time!, $to: Time!, $after: String) {
    sumContentDagSize(from: $from, to: $to, _size: 25000, _cursor: $after) {
      data
      after
    }
  }
`

const FIND_METRIC = gql`
  query FindMetric($key: String!) {
    findMetricByKey(key: $key) {
      key
      value
      updated
    }
  }
`

const CREATE_OR_UPDATE_METRIC = gql`
  mutation CreateOrUpdateMetric($data: CreateOrUpdateMetricInput!) {
    createOrUpdateMetric(data: $data) {
      key
      value
      updated
    }
  }
`

/**
 * @param {import('@web3-storage/db').DBClient} db
 * @param {typeof gql} query
 * @param {any} vars
 * @param {string} dataProp
 */
async function sumPaginate (db, query, vars, dataProp, onPage) {
  let after
  let total = 0
  while (true) {
    const res = await retry(() => db.query(query, { after, ...vars }), { onFailedAttempt: console.error })
    const data = res[dataProp]
    total += data.data[0] || 0
    onPage(total)
    after = data.after
    if (!after) break
  }
  return total
}

/**
 * @param {import('@web3-storage/db').DBClient} db
 * @param {string} key
 */
async function getMetric (db, key) {
  const { findMetricByKey } = await retry(() => db.query(FIND_METRIC, { key }))
  return findMetricByKey || { key, value: 0, updated: EPOCH }
}

/**
 * @param {{ db: import('@web3-storage/db').DBClient }} config
 */
export async function updateMetrics ({ db }) {
  await Promise.all([
    updateMetric(db, 'users_total', COUNT_USERS, {}, 'countUsers'),
    updateMetric(db, 'uploads_total', COUNT_UPLOADS, {}, 'countUploads'),
    updateMetric(db, 'content_total', COUNT_CIDS, {}, 'countContent'),
    updateMetric(db, 'content_bytes_total', SUM_CONTENT_DAG_SIZE, {}, 'sumContentDagSize'),
    updateMetric(db, 'pins_total', COUNT_PINS, {}, 'countPins'),
    updateMetric(db, 'pins_bytes_total', SUM_PIN_DAG_SIZE, {}, 'sumPinDagSize'),
    createMetric(db, 'pins_status_queued_total', COUNT_PINS_BY_STATUS, { status: 'PinQueued' }, 'countPinsByStatus'),
    createMetric(db, 'pins_status_pinning_total', COUNT_PINS_BY_STATUS, { status: 'Pinning' }, 'countPinsByStatus'),
    createMetric(db, 'pins_status_pinned_total', COUNT_PINS_BY_STATUS, { status: 'Pinned' }, 'countPinsByStatus'),
    createMetric(db, 'pins_status_failed_total', COUNT_PINS_BY_STATUS, { status: 'PinError' }, 'countPinsByStatus')
  ])
}

/**
 * @param {import('@web3-storage/db').DBClient} db
 * @param {string} key
 * @param {typeof gql} query
 * @param {any} vars
 * @param {string} dataProp
 */
async function createMetric (db, key, query, vars, dataProp) {
  const to = new Date(Date.now() - 1000)
  console.log(`ℹ️ Creating "${key}" metric from ${EPOCH} to ${to.toISOString()}`)

  vars = { ...vars, from: EPOCH, to: to.toISOString() }
  const total = await sumPaginate(db, query, vars, dataProp, total => {
    if (total) console.log(`➕ Incrementing "${key}" to ${total}`)
  })

  console.log(`💾 Saving value for "${key}": ${total}`)
  await db.query(CREATE_OR_UPDATE_METRIC, { data: { key, value: total, updated: to.toISOString() } })
}

/**
 * @param {import('@web3-storage/db').DBClient} db
 * @param {string} key
 * @param {typeof gql} query
 * @param {any} vars
 * @param {string} dataProp
 */
async function updateMetric (db, key, query, vars, dataProp) {
  const to = new Date(Date.now() - 1000)
  console.log(`🦴 Fetching current metric "${key}"...`)

  const metric = await getMetric(db, key)
  console.log(`ℹ️ Updating "${key}" metric from ${metric.updated} to ${to.toISOString()}`)

  vars = { ...vars, from: metric.updated, to: to.toISOString() }
  const total = await sumPaginate(db, query, vars, dataProp, total => {
    if (total) console.log(`➕ Incrementing "${key}" to ${metric.value + total}`)
  })

  if (!total) {
    return console.log(`🙅 "${key}" did not change value (${metric.value})`)
  }

  console.log(`💾 Saving new value for "${key}": ${metric.value + total}`)
  await db.query(CREATE_OR_UPDATE_METRIC, { data: { key, value: metric.value + total, updated: to.toISOString() } })
}
