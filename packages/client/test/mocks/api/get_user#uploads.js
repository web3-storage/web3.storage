module.exports = (opts) => {
  const { headers, query } = opts
  const res = require('../../fixtures/user/uploads-102.json')
  if (headers.authorization === 'Bearer good') {
    const { size, before } = query
    if (size > 100) {
      return {
        statusCode: 400,
        body: { message: 'max size 100' }
      }
    }
    const body = JSON.parse(JSON.stringify(res)).filter(u => u.created < before).slice(0, size)
    const responseHeaders = body.length === 100
      ? { Link: `</user/uploads/?size=${size}&before=${body[body.length - 1].created}>; rel="next"` }
      : {}
    return {
      statusCode: 200,
      body,
      headers: responseHeaders
    }
  }
  if (headers.authorization === 'Bearer error') {
    return {
      statusCode: 500,
      body: { message: 'Server Error' }
    }
  }
  return {
    statusCode: 404,
    body: { message: 'Not Found' }
  }
}
