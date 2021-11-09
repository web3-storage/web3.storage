
import { JSONResponse } from './utils/json-response.js'
import { toPinStatusEnum, waitToGetOkPins } from './utils/pin.js'

/**
 *
 * Service API Pin object definition
 * @typedef {Object} ServiceApiPin
 * @property {string} cid
 * @property {string} [name]
 * @property {Array.<string>} [origins]
 * @property {object} [meta]
 */

/**
 *
 * Service API Pin Status definition
 * @typedef {Object} ServiceApiPinStatus
 * @property {string} requestId
 * @property {string} status
 * @property {string} created
 * @property {Array<string>} delegates
 * @property {string} [info]
 *
 * @property {ServiceApiPin} pin
 */

/**
 * Pin DAG by cid.
 *
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function addPin (request, env, ctx) {
  const { cid } = await request.json()
  const { user } = request.auth

  const pinStatus = await createPin(cid, user._id, env, ctx)

  return new JSONResponse(pinStatus)
}

/**
 * @param {string} cid cid of the content to be pinned.
 * @param {number} userId user requesting the pin.
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @returns {Promise<ServiceApiPinStatus>}
 */
const createPin = async (cid, userId, env, ctx) => {
  // Request
  // ========
  // 1. Pin CID to Cluster
  // 2. Create Pin request in Database (not adding any content at this stage.)
  // ========
  //
  // Async task
  // ========
  // 1. Wait for ok pins
  // 2. Create a content, pin replication requests, pin objects and backups.
  // ========

  const normalizedCid = cid

  // TODO Is this the right initial Status to assign?
  const pinInitialStatus = toPinStatusEnum('pin_queued')

  /** @type {ServiceApiPin} */
  const serviceApiPin = {
    cid
  }

  env.cluster.pin(normalizedCid)

  const pinRequest = await env.db.createPinRequest({ cid, userId })

  /** @type {ServiceApiPinStatus} */
  const serviceApiPinStatus = {
    requestId: pinRequest.id.toString(),
    created: pinRequest.created,
    status: pinInitialStatus,
    delegates: [],
    pin: serviceApiPin
  }

  // Given we're pinning content that is currently not in the cluster, it might take a while to
  // get the cid from the network. We check pinning status asyncrounosly.
  /** @type {(() => Promise<any>)[]} */
  const tasks = [async () => {
    const okPins = await waitToGetOkPins(cid, env.cluster)
    // TODO Create backups?
    // TODO Get content dagSize
    // At this point we should be sure the content exists.
    env.db.createContent({ cid, dagSize: 100, pins: okPins })
    for (const pin of okPins) {
      await env.db.upsertPin(cid, pin)
    }
  }]

  if (ctx.waitUntil) {
    tasks.forEach(t => ctx.waitUntil(t()))
  }

  return serviceApiPinStatus
}
