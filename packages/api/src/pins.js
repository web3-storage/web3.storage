import { JSONResponse } from './utils/json-response.js'
import { normalizeCid } from './utils/normalize-cid.js'

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinPost (request, env, ctx) {
  const { cid, name, origins, meta } = await request.json()

  if (!cid) {
    return new JSONResponse(
      { error: { reason: `Invalid request id: ${cid}` }},
      { status: 400 }
    )
  }

  try {
    const normalizedCid = normalizeCid(cid)
  } catch (err) {
    return new JSONResponse(err)
  }

  // Validate name
  if (name && typeof name !== 'string') {
    return new JSONResponse(
      { error: { reason: 'INVALID_PIN_DATA', details: 'Invalid name' } },
      { status: 400 }
    )
  }

  // Validate origins
  if (origins && !Array.isArray(origins)) {
    return new JSONResponse(
      { error: { reason: 'INVALID_PIN_DATA', details: 'Invalid origins' } },
      { status: 400 }
    )
  }

  // Validate meta
  if (meta) {
    const res = new JSONResponse(
      { error: { reason: 'INVALID_PIN_DATA', details: 'Invalid metadata' } },
      { status: 400 }
    )
    if (typeof meta !== 'object' || Array.isArray(meta)) {
      return res
    }

    const hasStringValues = Object.entries(meta).some(([, v]) => typeof v === 'string')
    if (!hasStringValues) {
      return res
    }
  }

  // @todo: write logic for pinning cid
  return new JSONResponse('OK')
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinGet (request, env, ctx) {
  console.log('get pin')
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinsGet (request, env, ctx) {
  console.log('list pins')
}

/**
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function pinDelete (request, env, ctx) {
  console.log('delete pin req')
}
