const headers = { 'Content-Type': 'application/json' }
const gqlResponse = (statusCode, body) => ({ statusCode, headers, body })
const gqlOkResponse = data => gqlResponse(200, { data })

/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @typedef {{ query: string, variables: Record<string, any> }} GraphQLRequest
 * @param {{ body: GraphQLRequest }} request
 */
module.exports = ({ body }) => {
  if (body.query.includes('importCar')) {
    return gqlOkResponse({ importCar: { _id: 'test-auth-token' } })
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
    return gqlOkResponse({ createAuthToken: {} })
  }

  return gqlResponse(400, {
    errors: [{ message: `unexpected query: ${body.query}` }]
  })
}
