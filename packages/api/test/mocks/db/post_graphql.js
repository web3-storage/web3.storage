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
    if (body.variables.cid === 'unknown') {
      return gqlResponse(200, require('../../fixtures/find-content-by-cid-unknown.json'))
    }
    if (body.variables.cid === 'noaggregate') {
      return gqlResponse(200, require('../../fixtures/find-content-by-cid-no-aggregate.json'))
    }
    if (body.variables.cid === 'nodeal') {
      return gqlResponse(200, require('../../fixtures/find-content-by-cid-no-deal.json'))
    }
    return gqlResponse(200, require('../../fixtures/find-content-by-cid.json'))
  }

  if (body.query.includes('findMetrics')) {
    return gqlOkResponse(require('../../fixtures/find-metrics.json'))
  }

  if (body.query.includes('findUploadsByUser')) {
    return gqlResponse(200, require('../../fixtures/get-user-uploads/find-uploads-by-user.json'))
  }

  return gqlResponse(400, {
    errors: [{ message: `unexpected query: ${body.query}` }]
  })
}
