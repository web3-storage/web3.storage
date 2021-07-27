/* eslint-env serviceworker */
import { Router } from 'itty-router'
import { errorHandler } from './error-handler.js'
import { addCorsHeaders, withCorsHeaders, corsOptions } from './cors.js'
import { envAll } from './env.js'
import { statusGet } from './status.js'
import { carHead, carGet, carPost } from './car.js'
import { uploadPost } from './upload.js'
import { userLoginPost, userTokensPost, userTokensGet, userTokensDelete, userUploadsGet, userUploadsDelete, withAuth } from './user.js'
import { metricsGet } from './metrics.js'
import { notFound } from './utils/json-response.js'

const router = Router()

router.options('*', corsOptions)
router.all('*', envAll)
router.get('/car/:cid', withCorsHeaders(carGet))
router.head('/car/:cid', withCorsHeaders(carHead))
router.post('/car', withCorsHeaders(withAuth(carPost)))
router.post('/upload', withCorsHeaders(withAuth(uploadPost)))
router.get('/status/:cid', withCorsHeaders(statusGet))
router.post('/user/login', withCorsHeaders(userLoginPost))
router.get('/user/tokens', withCorsHeaders(withAuth(userTokensGet)))
router.post('/user/tokens', withCorsHeaders(withAuth(userTokensPost)))
router.delete('/user/tokens/:id', withCorsHeaders(withAuth(userTokensDelete)))
router.get('/user/uploads', withCorsHeaders(withAuth(userUploadsGet)))
router.delete('/user/uploads/:cid', withCorsHeaders(withAuth(userUploadsDelete)))

// Monitoring
router.get('/metrics', withCorsHeaders(metricsGet))

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
