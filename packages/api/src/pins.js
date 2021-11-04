
import { JSONResponse } from './utils/json-response.js'
import { toPinStatusEnum } from './utils/pin'

// Duration between status check polls in ms.
const PIN_STATUS_CHECK_INTERVAL = 5000
// Max time in ms to spend polling for an OK status.
const MAX_PIN_STATUS_CHECK_TIME = 30000

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

// Pin statuses considered OK.
const PIN_OK_STATUS = ['Pinned', 'Pinning', 'PinQueued']

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
  console.log(pinStatus)
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
  const normalizedCid = cid

  // TODO Is this the right initial Status to assign?
  const pinInitialStatus = toPinStatusEnum('pin_queued')

  /** @type {ServiceApiPin} */
  const serviceApiPin = {
    cid
  }

  await env.cluster.pin(normalizedCid)

  const pinRequest = await env.db.createPinRequest(cid, userId)

  /** @type {ServiceApiPinStatus} */
  const serviceApiPinStatus = {
    requestId: pinRequest._id.toString(),
    created: pinRequest.created,
    status: pinInitialStatus,
    delegates: [],
    pin: serviceApiPin
  }

  // Given we're pinning content that is currently not in the cluster, it might take a while to
  // get the cid from the network. We check pinning status asyncrounosly.
  /** @type {(() => Promise<any>)[]} */
  const tasks = [waitForOkPinsTaskCreator(cid, env)]

  if (ctx.waitUntil) {
    tasks.forEach(t => ctx.waitUntil(t()))
  }

  return serviceApiPinStatus
}

/**
 * Function that returns list of pins considered ok.
 *
 * @param {string} cid cid to be looked for
 * @param {import('./env').Env} env
 * @param {import('@nftstorage/ipfs-cluster').StatusResponse['peerMap']} [peerMap] Optional list of peers, if not provided the fuctions queries the cluster.
 */
export async function getOKpins (cid, env, peerMap) {
  if (!peerMap) {
    const status = await env.cluster.status(cid)
    peerMap = status.peerMap
  }
  const pins = toPins(peerMap)
  if (!pins.length) { // should not happen
    throw new Error('not pinning on any node')
  }

  return pins.filter(p => PIN_OK_STATUS.includes(p.status))
}

/**
 * @param {import('@nftstorage/ipfs-cluster').StatusResponse['peerMap']} peerMap
 * @return {Array.<import('../../db/db-client-types').PinUpsertInput>}
 */
export function toPins (peerMap) {
  return Object.entries(peerMap).map(([peerId, { peerName, status }]) => ({
    status: toPinStatusEnum(status),
    location: { peerId, peerName }
  }))
}

/**
 *
 * @param {string} cid
 * @param {import('./env').Env} env
 * @param {number} waitTime
 * @param {number} checkInterval
 * @return {() => Promise<any>}
 */
export function waitForOkPinsTaskCreator (cid, env, waitTime = MAX_PIN_STATUS_CHECK_TIME, checkInterval = PIN_STATUS_CHECK_INTERVAL) {
  return async () => {
    const start = Date.now()
    while (Date.now() - start > waitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval))
      const { peerMap } = await env.cluster.status(cid)
      const pins = toPins(peerMap)
      if (!pins.length) { // should not happen
        throw new Error('not pinning on any node')
      }

      const okPins = pins.filter(p => PIN_OK_STATUS.includes(p.status))
      if (!okPins.length) continue

      for (const pin of okPins) {
        await env.db.upsertPin(cid, pin)
      }
      return
    }
  }
}
