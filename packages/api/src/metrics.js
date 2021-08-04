/* global Response caches */

import { gql } from '@web3-storage/db'
import { METRICS_CACHE_MAX_AGE } from './constants.js'

const EPOCH = '2021-07-28T00:00:00.000Z'

const COUNT_USERS = gql`
  query CountUsers($from: Time!, $after: String) {
    countUsers(from: $from, _size: 80000, _cursor: $after) {
      data,
      after
    }
  }
`

const COUNT_UPLOADS = gql`
  query CountUploads($from: Time!, $after: String) {
    countUploads(from: $from, _size: 80000, _cursor: $after) {
      data,
      after
    }
  }
`

const COUNT_PINS = gql`
  query CountPins($from: Time!, $after: String) {
    countPins(from: $from, _size: 80000, _cursor: $after) {
      data,
      after
    }
  }
`

const COUNT_PINS_BY_STATUS = gql`
  query CountPinsByStatus($status: PinStatus!, $from: Time!, $after: String) {
    countPinsByStatus(status: $status, from: $from, _size: 80000, _cursor: $after) {
      data,
      after
    }
  }
`

const SUM_PIN_DAG_SIZE = gql`
  query SumPinDagSize($from: Time!, $after: String) {
    sumPinDagSize(from: $from, _size: 25000, _cursor: $after) {
      data
      after
    }
  }
`

const SUM_CONTENT_DAG_SIZE = gql`
  query SumContentDagSize($from: Time!, $after: String) {
    sumContentDagSize(from: $from, _size: 25000, _cursor: $after) {
      data
      after
    }
  }
`

/**
 * @param {import('@web3-storage/db').DBClient} db
 * @param {typeof gql} query
 * @param {any} vars
 * @param {string} dataProp
 */
async function sumPaginate (db, query, vars, dataProp) {
  let after
  let total = 0
  while (true) {
    const res = await db.query(query, { from: EPOCH, after, ...vars })
    console.log(res)
    const data = res[dataProp]
    total += data.data[0] || 0
    after = data.after
    if (!after) break
  }
  return total
}

/**
 * Retrieve metrics in prometheus exposition format.
 * https://prometheus.io/docs/instrumenting/exposition_formats/
 * @param {Request} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @returns {Promise<string>}
 */
export async function metricsGet (request, env, ctx) {
  const cache = caches.default
  let res = await cache.match(request)

  if (res) {
    return res
  }

  const [
    usersTotal,
    uploadsTotal,
    contentTotalBytes,
    pinsTotal,
    pinsTotalBytes,
    pinsQueuedTotal,
    pinsPinningTotal,
    pinsPinnedTotal,
    pinsFailedTotal
  ] = await Promise.all([
    sumPaginate(env.db, COUNT_USERS, {}, 'countUsers'),
    sumPaginate(env.db, COUNT_UPLOADS, {}, 'countUploads'),
    sumPaginate(env.db, SUM_CONTENT_DAG_SIZE, {}, 'sumContentDagSize'),
    sumPaginate(env.db, COUNT_PINS, {}, 'countPins'),
    sumPaginate(env.db, SUM_PIN_DAG_SIZE, {}, 'sumPinDagSize'),
    sumPaginate(env.db, COUNT_PINS_BY_STATUS, { status: 'PinQueued' }, 'countPinsByStatus'),
    sumPaginate(env.db, COUNT_PINS_BY_STATUS, { status: 'Pinning' }, 'countPinsByStatus'),
    sumPaginate(env.db, COUNT_PINS_BY_STATUS, { status: 'Pinned' }, 'countPinsByStatus'),
    sumPaginate(env.db, COUNT_PINS_BY_STATUS, { status: 'PinError' }, 'countPinsByStatus')
  ])

  const metrics = [
    '# HELP web3storage_users_total Total users registered.',
    '# TYPE web3storage_users_total counter',
    `web3storage_users_total ${usersTotal}`,

    '# HELP web3storage_uploads_total Total number of user uploads.',
    '# TYPE web3storage_uploads_total counter',
    `web3storage_uploads_total ${uploadsTotal}`,

    '# HELP web3storage_content_bytes_total Total bytes of all unique DAGs stored.',
    '# TYPE web3storage_content_bytes_total counter',
    `web3storage_content_bytes_total ${contentTotalBytes}`,

    '# HELP web3storage_pins_total Total number of pins on the IPFS Cluster',
    '# TYPE web3storage_pins_total counter',
    `web3storage_pins_total ${pinsTotal}`,

    '# HELP web3storage_pins_bytes_total Total size in bytes of pins on the IPFS Cluster',
    '# TYPE web3storage_pins_bytes_total counter',
    `web3storage_pins_bytes_total ${pinsTotalBytes}`,

    '# HELP web3storage_pins_status_queued_total Total number of pins that are queued.',
    '# TYPE web3storage_pins_status_queued_total counter',
    `web3storage_pins_status_queued_total ${pinsQueuedTotal}`,

    '# HELP web3storage_pins_status_pinning_total Total number of pins that are pinning.',
    '# TYPE web3storage_pins_status_pinning_total counter',
    `web3storage_pins_status_pinning_total ${pinsPinningTotal}`,

    '# HELP web3storage_pins_status_pinned_total Total number of pins that are pinned.',
    '# TYPE web3storage_pins_status_pinned_total counter',
    `web3storage_pins_status_pinned_total ${pinsPinnedTotal}`,

    '# HELP web3storage_pins_status_failed_total Total number of pins that are failed.',
    '# TYPE web3storage_pins_status_failed_total counter',
    `web3storage_pins_status_failed_total ${pinsFailedTotal}`
  ].join('\n')

  res = new Response(metrics, {
    headers: {
      // cache metrics response
      'Cache-Control': `public, max-age=${METRICS_CACHE_MAX_AGE}`
    }
  })

  ctx.waitUntil(cache.put(request, res.clone()))

  return res
}
