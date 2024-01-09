import { FeatureHasBeenSunsetError, HTTPError, MaintenanceError } from './errors.js'
import { getTokenFromRequest } from './auth.js'

/**
 * @typedef {'rw' | 'r-' | '--'} Mode
 * @typedef {import('itty-router').RouteHandler} Handler
 */

/**
 * Read and write.
 */
export const READ_WRITE = 'rw'

/**
 * Read only mode.
 */
export const READ_ONLY = 'r-'

/**
 * No reading or writing.
 */
export const NO_READ_OR_WRITE = '--'

/** @type {readonly Mode[]} */
export const modes = Object.freeze([NO_READ_OR_WRITE, READ_ONLY, READ_WRITE])

/**
 * The default maintenance mode (normal operation).
 */
export const DEFAULT_MODE = READ_WRITE

/**
 * Middleware: Specify the mode (permissions) a request hander requires to operate e.g.
 * r- = only needs read permission so enabled in read-only AND read+write modes.
 * rw = needs to read and write so only enabled in read+write mode.
 *
 * This is expected to be used as a multi-route (Upstream) Middleware like `router.get('*', withMode(READ_ONLY))`.
 *
 * @param {Mode} mode
 * @returns {Handler}
 */
export function withMode (mode) {
  if (mode === NO_READ_OR_WRITE) {
    throw new Error('invalid mode')
  }

  /**
   * @param {Request} request
   * @param {import('./env').Env} env
   * @returns {Response|undefined}
   */
  return (request, env, ctx) => {
    const currentMode = env.MODE
    const currentModeBits = modeBits(currentMode)

    const enabled = () => {
      return modeBits(mode).every((bit, i) => {
        if (bit === '-') {
          return true
        }
        return currentModeBits[i] === bit
      })
    }

    const modeSkip = () => {
      if (!request.headers) {
        return false
      }

      const list = env.modeSkipList
      const token = getTokenFromRequest(request, env)

      if (list.includes(token)) {
        return true
      }
      return false
    }

    // Not enabled, use maintenance handler.
    if (!enabled() && !modeSkip()) {
      const isAfterSunsetStart = env.NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START ? (env.NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START < new Date().toISOString()) : false
      if (isAfterSunsetStart && (currentMode === READ_ONLY)) {
        throw new FeatureHasBeenSunsetError('This API feature has been sunset, and is no longer available. To continue uploading, use the new web3.storage API: https://web3.storage/docs.')
      }
      return maintenanceHandler()
    }
  }
}

/**
 * @param {any} m
 * @returns {string[]}
 */
function modeBits (m) {
  if (!modes.includes(m)) {
    throw new HTTPError(
      `invalid maintenance mode, wanted one of ${modes} but got "${m}"`,
      503
    )
  }
  return m.split('')
}

/**
 * @returns {never}
 */
export function maintenanceHandler () {
  const url = 'https://status.web3.storage'
  throw new MaintenanceError(`API undergoing maintenance, check ${url} for more info`)
}
