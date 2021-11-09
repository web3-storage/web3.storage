const express = require('express')
const next = require('next')
const fetch = require('@web-std/fetch')
const { createProxyMiddleware } = require("http-proxy-middleware")

const port = process.env.PORT || 4000
const docsPort = process.env.DOCS_PORT || 3030
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const docsURL = `http://localhost:${docsPort}`

const docsPaths = {
    '/docs': {
        target: docsURL, 
        pathRewrite: {
            '^/docs': '/docs'
        },
        changeOrigin: true
    }
}

const isDevelopment = process.env.NODE_ENV !== 'production'

async function waitForDocsServer() {
  console.log(`waiting for docs dev server to respond at ${docsURL}`)
  const maxRetries = 60
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(docsURL)
    if (res.ok) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`docs dev server not responding after ${maxRetries} attempts`)
}

app.prepare().then(() => {
  const server = express()
 
  if (isDevelopment) {
    server.use('/docs', createProxyMiddleware(docsPaths['/docs']));
  }

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })

  if (isDevelopment) {
    return waitForDocsServer()
  }
}).catch(err => {
    console.log('Error:::::', err)
})