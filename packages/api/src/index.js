/* eslint-env serviceworker */
import { Router } from 'itty-router'
import { errorHandler } from './error-handler.js'
import { addCorsHeaders, withCorsHeaders, corsOptions } from './cors.js'
import { withApiOrMagicToken, withMagicToken } from './auth.js'
import { envAll } from './env.js'
import { statusGet } from './status.js'
import { carHead, carGet, carPut, carPost } from './car.js'
import { uploadPost } from './upload.js'
import { userLoginPost, userTokensPost, userTokensGet, userTokensDelete, userUploadsGet, userUploadsDelete, userAccountGet, userUploadsRename, userInfoGet } from './user.js'
import { metricsGet } from './metrics.js'
import { versionGet } from './version.js'
import {
  withMode,
  READ_ONLY,
  READ_WRITE
} from './maintenance.js'
import { notFound } from './utils/json-response.js'
import { nameGet, namePost } from './name.js'

const router = Router()
router.options('*', corsOptions)
router.all('*', envAll)

const auth = {
  '🤲': handler => withCorsHeaders(handler),
  '🔒': handler => withCorsHeaders(withApiOrMagicToken(handler)),
  '👮': handler => withCorsHeaders(withMagicToken(handler))
}

const mode = {
  '👀': handler => withMode(handler, READ_ONLY),
  '📝': handler => withMode(handler, READ_WRITE)
}

/* eslint-disable no-multi-spaces */
router.post('/user/login',          mode['👀'](auth['🤲'](userLoginPost)))
router.get('/status/:cid',          mode['👀'](auth['🤲'](statusGet)))
router.get('/car/:cid',             mode['👀'](auth['🤲'](carGet)))
router.head('/car/:cid',            mode['👀'](auth['🤲'](carHead)))

router.post('/car',                 mode['📝'](auth['🔒'](carPost)))
router.put('/car/:cid',             mode['📝'](auth['🔒'](carPut)))
router.post('/upload',              mode['📝'](auth['🔒'](uploadPost)))
router.get('/user/uploads',         mode['👀'](auth['🔒'](userUploadsGet)))

router.get('/name/:key',            mode['👀'](auth['🤲'](nameGet)))
router.post('/name/:key',           mode['📝'](auth['🔒'](namePost)))

router.delete('/user/uploads/:cid',      mode['📝'](auth['👮'](userUploadsDelete)))
router.post('/user/uploads/:cid/rename', mode['📝'](auth['👮'](userUploadsRename)))
router.get('/user/tokens',               mode['👀'](auth['👮'](userTokensGet)))
router.post('/user/tokens',              mode['📝'](auth['👮'](userTokensPost)))
router.delete('/user/tokens/:id',        mode['📝'](auth['👮'](userTokensDelete)))
router.get('/user/account',              mode['👀'](auth['👮'](userAccountGet)))
router.get('/user/info',                 mode['👀'](auth['👮'](userInfoGet)))
/* eslint-enable no-multi-spaces */

// Monitoring
router.get('/metrics', mode['👀'](withCorsHeaders(metricsGet)))

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

addEventListener('fetch', (event) => {
  const env = {}
  event.respondWith(router
    .handle(event.request, env, event)
    .catch((e) => serverError(e, event.request, env))
  )
})
