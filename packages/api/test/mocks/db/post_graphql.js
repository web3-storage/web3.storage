const headers = { 'Content-Type': 'application/json' }
const gqlResponse = (statusCode, body) => ({ statusCode, headers, body })
const gqlOkResponse = data => gqlResponse(200, { data })

/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @typedef {{ query: string, variables: Record<string, any> }} GraphQLRequest
 * @param {{ body: GraphQLRequest }} request
 */
module.exports = ({ body }) => {
  if (body.query.includes('createUpload')) {
    return gqlOkResponse({
      createUpload: { content: { _id: 'test-content' } }
    })
  }

  if (body.query.includes('verifyAuthToken')) {
    return gqlOkResponse({
      verifyAuthToken: {
        _id: 'test-auth-token',
        name: 'Test Auth Token',
        user: {
          _id: 'test',
          issuer: body.variables.issuer
        }
      }
    })
  }

  if (body.query.includes('findAuthTokensByUser')) {
    return gqlOkResponse({
      findAuthTokensByUser: {
        data: [{
          _id: 'test-auth-token',
          name: 'Test Auth Token',
          secret: 'test-auth-token-secret',
          created: Date.now()
        }]
      }
    })
  }

  if (body.query.includes('createAuthToken')) {
    return gqlOkResponse({ createAuthToken: { _id: 'test-auth-token' } })
  }

  if (body.query.includes('deleteAuthToken')) {
    return gqlOkResponse({ deleteAuthToken: { _id: 'test-auth-token' } })
  }

  if (body.query.includes('deleteUserUpload')) {
    return gqlOkResponse({ deleteUserUpload: { _id: 'test-delete-user-upload' } })
  }

  if (body.query.includes('findContentByCid')) {
    const { cid } = body.variables
    let res
    if (cid === 'unknown') {
      res = require('../../fixtures/find-content-by-cid-unknown.json')
    } else if (cid === 'noaggregate') {
      res = require('../../fixtures/find-content-by-cid-no-aggregate.json')
    } else if (cid === 'nodeal') {
      res = require('../../fixtures/find-content-by-cid-no-deal.json')
    } else {
      res = require('../../fixtures/find-content-by-cid.json')
    }
    if (res.data.findContentByCid) {
      res.data.findContentByCid.cid = cid
    }
    return gqlResponse(200, res)
  }

  if (body.query.includes('findMetrics')) {
    return gqlOkResponse(require('../../fixtures/find-metrics.json'))
  }

  if (body.query.includes('findUploadsByUser')) {
    const res = require('../../fixtures/get-user-uploads/find-uploads-by-user.json')
    const size = body.variables.size
    if (size && size < 3) {
      const trimmed = JSON.parse(JSON.stringify(res))
      // trim it down to the expected number
      trimmed.data.findUploadsByUser.data = trimmed.data.findUploadsByUser.data.slice(0, size)
      return gqlResponse(200, trimmed)
    }
    return gqlResponse(200, res)
  }

  return gqlResponse(400, {
    errors: [{ message: `unexpected query: ${body.query}` }]
  })
}
