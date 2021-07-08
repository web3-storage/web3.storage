import { gql } from '@web3-storage/db'
import { GATEWAY } from './constants.js'
import { JSONResponse } from './utils/json-response.js'

const LOCAL_ADD_THRESHOLD = 1024 * 1024 * 2.5

// TODO: ipfs should let us ask the size of a CAR file.
// This consumes the CAR response from ipfs to find the content-length.
export async function carHead(request, env, ctx) {
  // cache the thing. can't cache a HEAD request, so make a new one.
  const get = new Request(request.url, { method: 'GET' })
  // add the router params
  get.params = request.params
  const res = await carGet(get, env, ctx)
  const size = await sizeOf(res)
  const headers = new Headers(res.headers)
  headers.set('Content-Length', size)
  // skip the body, it's a HEAD.
  return new Response(null, { headers })
}

export async function carGet(request, env, ctx) {
  const cache = caches.default
  let res = await cache.match(request)

  if (res) {
    return res
  }

  const {
    params: { cid },
  } = request
  // gateway does not support `carversion` yet.
  // using it now means we can skip the cache if it is supported in the future
  const url = new URL(`/api/v0/dag/export?arg=${cid}&carversion=1`, GATEWAY)
  res = await fetch(url, { method: 'POST' })
  if (!res.ok) {
    // bail early. dont cache errors.
    return res
  }
  // Clone the response so that it's no longer immutable. Ditch the original headers.
  // Note: keeping the original headers seems to prevent the carHead function from setting Content-Length
  res = new Response(res.body)
  res.headers.set('Content-Type', 'application/car')
  // cache for 1 year, the max max-age value.
  res.headers.set('Cache-Control', 'public, max-age=31536000')
  // without the content-disposition, firefox describes them as DMS files.
  res.headers.set('Content-Disposition', `attachment; filename="${cid}.car"`)
  // always https pls.
  res.headers.set('Strict-Transport-Security', `max-age=31536000; includeSubDomains; preload"`)
  // // compress if asked for? is it worth it?
  // if (request.headers.get('Accept-Encoding').match('gzip')) {
  //   headers['Content-Encoding'] = 'gzip'
  // }
  ctx.waitUntil(cache.put(request, res.clone()))
  return res
}

/**
 * Post a CAR file.
 *
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function carPost(request, env) {
  const { user, authToken } = request.auth
  const { headers } = request

  let name = headers.get('x-name')
  if (!name || typeof name !== 'string') {
    name = `Upload at ${new Date().toISOString()}`
  }

  const blob = await request.blob()

  // Ensure car blob.type is set; it is used by the cluster client to set the foramt=car flag on the /add call.
  const content = blob.slice(0, blob.size, 'application/car')

  const { cid } = await env.cluster.add(content, {
    metadata: { size: content.size.toString() },
    // When >2.5MB, use local add, because waiting for blocks to be sent to
    // other cluster nodes can take a long time. Replication to other nodes
    // will be done async by bitswap instead.
    local: blob.size > LOCAL_ADD_THRESHOLD,
  })

  // Store in DB
  await env.db.query(gql`
    mutation importCar($data: ImportCarInput!) {
      importCar(data: $data) {
        name
      }
    }
  `, {
    data: {
      user: user._id,
      authToken: authToken?._id,
      cid,
      name
      // dagSize: undefined // TODO: should we default to chunk car behavior?
    }
  })

  // TODO: Improve response type with pin information
  return new JSONResponse({ cid })
}

export async function carPut(request, env, ctx) {
  return new Response(`${request.method} /car no can has`, { status: 501 })
}

export async function sizeOf(response) {
  const reader = response.body.getReader()
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    // this should be ok up to about 9 Petabytes.
    // Number.MAX_SAFE_INTEGER = 9,007,199,254,740,991
    size += value.byteLength
  }
  return size
}
