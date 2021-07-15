/* eslint-env serviceworker */
import { Router } from 'itty-router'
import { addCorsHeaders, withCorsHeaders, corsOptions } from './cors.js'
import { envAll } from './env.js'
import { statusGet } from './status.js'
import { carHead, carGet, carPut, carPost } from './car.js'
import { userLoginPost, userTokensPost, userTokensGet, userTokensDelete, userUploadsGet, userUploadsDelete, withAuth } from './user.js'
import { JSONResponse, notFound } from './utils/json-response.js'

const router = Router()

router.options('*', corsOptions)
router.all('*', envAll)
router.get('/car/:cid', withCorsHeaders(carGet))
router.head('/car/:cid', withCorsHeaders(carHead))
router.put('/car/:cid', withCorsHeaders(withAuth(carPut)))
router.post('/car', withCorsHeaders(withAuth(carPost)))
router.get('/status/:cid', withCorsHeaders(statusGet))
router.post('/user/login', withCorsHeaders(userLoginPost))
router.get('/user/tokens', withCorsHeaders(withAuth(userTokensGet)))
router.post('/user/tokens', withCorsHeaders(withAuth(userTokensPost)))
router.delete('/user/tokens/:id', withCorsHeaders(withAuth(userTokensDelete)))
router.get('/user/uploads', withCorsHeaders(withAuth(userUploadsGet)))
router.delete('/user/uploads/:cid', withCorsHeaders(withAuth(userUploadsDelete)))

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

function serverError (request, error) {
  console.error(error.stack)
  const message = error.message || 'Server Error'
  const status = error.status || 500
  return addCorsHeaders(request, new JSONResponse({ message }, { status }))
}

addEventListener('fetch', (event) => {
  event.respondWith(router
    .handle(event.request, {}, event)
    .catch((e) => serverError(event.request, e))
  )
})
