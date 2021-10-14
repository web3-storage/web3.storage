/* global Response caches */

import { METRICS_CACHE_MAX_AGE } from './constants.js'

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
    env.db.getMetricsValue('users_total'),
    env.db.getMetricsValue('uploads_total'),
    env.db.getMetricsValue('content_bytes_total'),
    env.db.getMetricsValue('pins_total'),
    env.db.getMetricsValue('pins_bytes_total'),
    env.db.getMetricsValue('pins_status_queued_total'),
    env.db.getMetricsValue('pins_status_pinning_total'),
    env.db.getMetricsValue('pins_status_pinned_total'),
    env.db.getMetricsValue('pins_status_failed_total')
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
