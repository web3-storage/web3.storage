/* global Response caches */

import { METRICS_CACHE_MAX_AGE, PIN_STATUSES, UPLOAD_TYPES } from './constants.js'

/**
 * Retrieve metrics in prometheus exposition format.
 * https://prometheus.io/docs/instrumenting/exposition_formats/
 * @param {Request} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @returns {Promise<string>}
 */
export async function metricsGet (request, env, ctx) {
  // @ts-ignore
  const cache = caches.default
  let res = await cache.match(request)

  if (res) {
    return res
  }

  const [
    usersTotal,
    uploadsTotal,
    uploadMetrics,
    contentTotalBytes,
    pinsTotal,
    pinsMetrics,
    pinsRequestsTotal
  ] = await Promise.all([
    env.db.getMetricsValue('users_total'),
    env.db.getMetricsValue('uploads_total'),
    Promise.all(
      UPLOAD_TYPES.map(async (t) => ({
        type: t,
        total: await env.db.getMetricsValue(`uploads_${t.toLowerCase()}_total`)
      }))
    ),
    env.db.getMetricsValue('content_bytes_total'),
    env.db.getMetricsValue('pins_total'),
    Promise.all(
      PIN_STATUSES.map(async (s) => ({
        status: s,
        total: await env.db.getMetricsValue(`pins_${s.toLowerCase()}_total`)
      }))
    ),
    env.db.getMetricsValue('pin_requests_total')
  ])

  const metrics = [
    '# HELP web3storage_users_total Total users registered.',
    '# TYPE web3storage_users_total counter',
    `web3storage_users_total ${usersTotal}`,

    '# HELP web3storage_uploads_total Total number of user uploads.',
    '# TYPE web3storage_uploads_total counter',
    `web3storage_uploads_total ${uploadsTotal}`,
    ...uploadMetrics.map(
      ({ type, total }) =>
        `web3storage_uploads_total{type="${type}"} ${total || 0}`
    ),

    '# HELP web3storage_content_bytes_total Total bytes of all unique DAGs stored.',
    '# TYPE web3storage_content_bytes_total counter',
    `web3storage_content_bytes_total ${contentTotalBytes}`,

    '# HELP web3storage_pins_total Total number of pins on the IPFS Cluster',
    '# TYPE web3storage_pins_total counter',
    `web3storage_pins_total ${pinsTotal}`,
    ...pinsMetrics.map(
      ({ status, total }) =>
        `web3storage_pins_total{status="${status}"} ${total || 0}`
    ),

    '# HELP web3storage_pin_requests_total Total number of pin requests via Pinning Service API.',
    '# TYPE web3storage_pin_requests_total counter',
    `web3storage_pin_requests_total ${pinsRequestsTotal}`
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
