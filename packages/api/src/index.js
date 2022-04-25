/* eslint-env serviceworker */
import { Router } from 'itty-router'
import { errorHandler } from './error-handler.js'
import { addCorsHeaders, withCorsHeaders, corsOptions } from './cors.js'
import { withAccountNotRestricted, withApiOrMagicToken, withMagicToken, withPinningAuthorized } from './auth.js'
import { envAll } from './env.js'
import { statusGet } from './status.js'
import { carHead, carGet, carPut, carPost } from './car.js'
import { uploadPost } from './upload.js'
import { userLoginPost, userTokensPost, userTokensGet, userTokensDelete, userUploadsGet, userUploadsDelete, userAccountGet, userUploadsRename, userInfoGet } from './user.js'
import { pinDelete, pinGet, pinPost, pinsGet } from './pins.js'
import { metricsGet } from './metrics.js'
import { versionGet } from './version.js'
import {
  withMode,
  READ_ONLY,
  READ_WRITE
} from './maintenance.js'
import { notFound } from './utils/json-response.js'
import { nameGet, nameWatchGet, namePost } from './name.js'

const router = Router()
router.options('*', corsOptions)
router.all('*', envAll)

/**
 * Takes any number of functions and invokes them all one after the other
 *
 * @param  {...function(...any):any} fns
 * @returns
 */
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x)

/**
 * It defines a list of "middlewares" that need to be applied for a given authentication mode.
 * Each value takes an endpoint handler and returns a "composed" version.
 *
 * @type {Object.<string, function(...any):any>}
 */
const auth = {
  '🤲': withCorsHeaders,
  '🔒': compose(withCorsHeaders, withApiOrMagicToken),
  '👮': compose(withCorsHeaders, withMagicToken),
  '🚫': compose(withCorsHeaders, withApiOrMagicToken, withAccountNotRestricted),
  '👀📌': compose(withCorsHeaders, withApiOrMagicToken, withPinningAuthorized),
  '📝📌': compose(withCorsHeaders, withApiOrMagicToken, withAccountNotRestricted, withPinningAuthorized)
}

const mode = {
  '👀': handler => withMode(handler, READ_ONLY),
  '📝': handler => withMode(handler, READ_WRITE)
}

/* eslint-disable no-multi-spaces */
router.post('/user/login',          compose(mode['📝'], auth['🤲'])(userLoginPost))
router.get('/status/:cid',          compose(mode['📝'], auth['🤲'])(statusGet))
router.get('/car/:cid',             compose(mode['📝'], auth['🤲'])(carGet))
router.head('/car/:cid',            compose(mode['📝'], auth['🤲'])(carHead))

router.post('/car',                 compose(mode['📝'], auth['🚫'])(carPost))
router.put('/car/:cid',             compose(mode['📝'], auth['🚫'])(carPut))
router.post('/upload',              compose(mode['📝'], auth['🚫'])(uploadPost))
router.get('/user/uploads',         compose(mode['👀'], auth['🔒'])(userUploadsGet))

router.post('/pins',                compose(mode['📝'], auth['📝📌'])(pinPost))
router.post('/pins/:requestId',     compose(mode['📝'], auth['📝📌'])(pinPost))
router.get('/pins/:requestId',      compose(mode['👀'], auth['👀📌'])(pinGet))
router.get('/pins',                 compose(mode['👀'], auth['👀📌'])(pinsGet))
router.delete('/pins/:requestId',   compose(mode['📝'], auth['👀📌'])(pinDelete))

router.get('/name/:key',            compose(mode['👀'], auth['🤲'])(nameGet))
router.get('/name/:key/watch',      compose(mode['👀'], auth['🤲'])(nameWatchGet))
router.post('/name/:key',           compose(mode['📝'], auth['🚫'])(namePost))

router.delete('/user/uploads/:cid',      compose(mode['📝'], auth['👮'])(userUploadsDelete))
router.post('/user/uploads/:cid/rename', compose(mode['📝'], auth['👮'])(userUploadsRename))
router.get('/user/tokens',               compose(mode['👀'], auth['👮'])(userTokensGet))
router.post('/user/tokens',              compose(mode['📝'], auth['👮'])(userTokensPost))
router.delete('/user/tokens/:id',        compose(mode['📝'], auth['👮'])(userTokensDelete))
router.get('/user/account',              compose(mode['👀'], auth['👮'])(userAccountGet))
router.get('/user/info',                 compose(mode['👀'], auth['👮'])(userInfoGet))
/* eslint-enable no-multi-spaces */

// Monitoring
router.get('/metrics', compose(mode['👀'], withCorsHeaders)(metricsGet))

// Version
router.get('/version', withCorsHeaders(versionGet))

router.get('/', () => {
  return new Response(
    `
<body style="font-family: -apple-system, system-ui">
  <h1>⁂</h1>
  <p>try
    <a href='/car/bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy'>
      /car/bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy
    </a>
  </p>
</body>`,
    {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=UTF-8'
      }
    }
  )
})

router.get('/error', () => { throw new Error('A deliberate error!') })
router.all('*', withCorsHeaders(() => notFound()))

/**
 * @param {Error} error
 * @param {Request} request
 * @param {import('./env').Env} env
 */
function serverError (error, request, env) {
  return addCorsHeaders(request, errorHandler(error, env))
}

// https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent
/** @typedef {{ waitUntil(p: Promise): void }} Ctx */

export default {
  async fetch (request, env, ctx) {
    try {
      return await router.handle(request, env, ctx)
    } catch (error) {
      return serverError(error, request, env)
    }
  }
}

export { NameRoom as NameRoom0 } from './name.js'
