import { Router } from 'itty-router'
import { withCorsHeaders, corsOptions } from './cors.js'
import { envAll } from './env.js'
import { carHead, carGet, carPut, carPost } from './car.js'
import { userLoginPost, userKeysPost, withAuth } from './user.js'

const router = Router()

router.options('*', corsOptions)
router.all('*', envAll)
router.get('/car/:cid', withCorsHeaders(carGet))
router.head('/car/:cid', withCorsHeaders(carHead))
router.put('/car/:cid', withCorsHeaders(withAuth(carPut)))
router.post('/car', withCorsHeaders(withAuth(carPost)))
router.post('/user/login', withCorsHeaders(userLoginPost))
router.post('/user/keys', withCorsHeaders(withAuth(userKeysPost)))

router.get('/', () => {
  return new Response(
    `
<body style="font-family: -apple-system, system-ui">
  <h1>📦</h1>
  <p>try
    <a href='/car/bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy'>
      /car/bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy
    </a>
  </p>
</body>`,
    {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=UTF-8',
      },
    }
  )
})

router.all('*', () => new Response('Not Found.', { status: 404 }))

async function serverError(error) {
  return new Response(error.message || 'Server Error', {
    status: error.status || 500,
  })
}

addEventListener('fetch', (event) =>
  event.respondWith(router.handle(event.request, {}, event).catch(serverError))
)
