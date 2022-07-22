/* eslint-env serviceworker */
import { Router } from 'itty-router'
import { errorHandler } from './error-handler.js'
import { addCorsHeaders, withCorsHeaders, corsOptions } from './cors.js'
import { withAccountNotRestricted, withDeleteNotRestricted, withApiOrMagicToken, withMagicToken, withPinningAuthorized } from './auth.js'
import { envAll } from './env.js'
import { statusGet } from './status.js'
import { carHead, carGet, carPut, carPost } from './car.js'
import { uploadPost } from './upload.js'
import { userLoginPost, userTokensPost, userTokensGet, userTokensDelete, userUploadsGet, userUploadGet, userUploadsDelete, userAccountGet, userUploadsRename, userInfoGet, userRequestPost } from './user.js'
import { pinDelete, pinGet, pinPost, pinsGet } from './pins.js'
import { blogSubscriptionCreate } from './blog.js'
import { metricsGet } from './metrics.js'
import { versionGet } from './version.js'
import {
  withMode,
  READ_ONLY,
  READ_WRITE
} from './maintenance.js'
import { notFound } from './utils/json-response.js'
import { nameGet, nameWatchGet, namePost } from './name.js'
import { compose } from './utils/fn.js'

const router = Router()

/**
 * It defines a list of "middlewares" that need to be applied for a given authentication mode.
 * Each value takes an endpoint handler and returns a "composed" version.
 *
 * @type {Object.<string, function(...any):any>}
 */
const auth = {
  // world readable!
  '🌍': withCorsHeaders,

  // any key will do.
  '🔑': compose(withCorsHeaders, withApiOrMagicToken, withAccountNotRestricted),

  // any key will do & restricted users allowed!
  '🔑⚠️': compose(withCorsHeaders, withApiOrMagicToken),

  // must be a logged in user
  '👤': compose(withCorsHeaders, withMagicToken),

  // must be a logged in user with no delete restriction
  '👤🗑️': compose(withCorsHeaders, withMagicToken, withDeleteNotRestricted),

  // needs PSA & restricted users allowed
  '📌⚠️': compose(withCorsHeaders, withApiOrMagicToken, withPinningAuthorized),

  // needs PSA & restricted users with no delete restriction allowed
  '📌⚠️🗑️': compose(withCorsHeaders, withApiOrMagicToken, withDeleteNotRestricted, withPinningAuthorized),

  // needs PSA
  '📌': compose(withCorsHeaders, withApiOrMagicToken, withAccountNotRestricted, withPinningAuthorized) // needs PSA
}

/* eslint-disable no-multi-spaces */
router.all('*', envAll)
router.options('*', corsOptions)

// Exception for login to not be handled by POST mode middleware
// Needs to be added first
router.post('/user/login',          auth['🌍'](userLoginPost))

router.get('*', withMode(READ_ONLY))
router.head('*', withMode(READ_ONLY))
router.delete('*', withMode(READ_WRITE))
router.post('*', withMode(READ_WRITE))

router.get('/status/:cid',          auth['🌍'](statusGet))
router.get('/car/:cid',             auth['🌍'](carGet))
router.head('/car/:cid',            auth['🌍'](carHead))

router.post('/car',                 auth['🔑'](carPost))
router.put('/car/:cid',             auth['🔑'](carPut))
router.post('/upload',              auth['🔑'](uploadPost))
router.get('/user/uploads',         auth['🔑⚠️'](userUploadsGet))
router.get('/user/uploads/:cid',    auth['🔑⚠️'](userUploadGet))

router.post('/pins',                auth['📌'](pinPost))
router.post('/pins/:requestId',     auth['📌'](pinPost))
router.get('/pins/:requestId',      auth['📌⚠️'](pinGet))
router.get('/pins',                 auth['📌⚠️'](pinsGet))
router.delete('/pins/:requestId',   auth['📌⚠️🗑️'](pinDelete))

router.get('/name/:key',            auth['🌍'](nameGet))
router.get('/name/:key/watch',      auth['🌍'](nameWatchGet))
router.post('/name/:key',           auth['🔑'](namePost))

router.post('/blog/subscription',   auth['🌍'](blogSubscriptionCreate))

router.delete('/user/uploads/:cid',      auth['👤🗑️'](userUploadsDelete))
router.post('/user/uploads/:cid/rename', auth['👤'](userUploadsRename))
router.get('/user/tokens',               auth['👤'](userTokensGet))
router.post('/user/tokens',              auth['👤'](userTokensPost))
router.post('/user/request',             auth['👤'](userRequestPost))
router.delete('/user/tokens/:id',        auth['👤🗑️'](userTokensDelete))
router.get('/user/account',              auth['👤'](userAccountGet))
router.get('/user/info',                 auth['👤'](userInfoGet))
/* eslint-enable no-multi-spaces */

// Monitoring
router.get('/metrics', auth['🌍'](metricsGet))

// Version
router.get('/version', auth['🌍'](versionGet))

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
router.all('*', auth['🌍'](() => notFound()))

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
    let response
    try {
      env = { ...env } // new env object for every request (it is shared otherwise)!
      response = await router.handle(request, env, ctx)
    } catch (error) {
      response = serverError(error, request, env)
    }
    await env.log.end(response)
    return response
  }
}

export { NameRoom as NameRoom0 } from './name.js'
