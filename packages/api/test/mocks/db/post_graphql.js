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
          created: Date.now(),
          uploads: {
            data: []
          }
        }]
      }
    })
  }

  if (body.query.includes('findUserByIssuer')) {
    const { issuer } = body.variables
    if (issuer === 'test-magic-issuer') {
      return gqlOkResponse({
        findUserByIssuer: {
          data: [{
            _id: 'test-magic',
            issuer
          }]
        }
      })
    }
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

  if (body.query.includes('countPinsByStatus')) {
    return gqlOkResponse(require('../../fixtures/count-pins-by-status.json'))
  }

  if (body.query.includes('countPins')) {
    return gqlOkResponse(require('../../fixtures/count-pins.json'))
  }

  if (body.query.includes('countUploads')) {
    return gqlOkResponse(require('../../fixtures/count-uploads.json'))
  }

  if (body.query.includes('countUsers')) {
    return gqlOkResponse(require('../../fixtures/count-users.json'))
  }

  if (body.query.includes('sumContentDagSize')) {
    return gqlOkResponse(require('../../fixtures/sum-content-dag-size.json'))
  }

  if (body.query.includes('sumPinDagSize')) {
    return gqlOkResponse(require('../../fixtures/sum-pin-dag-size.json'))
  }

  if (body.query.includes('findUserByID')) {
    return gqlOkResponse(require('../../fixtures/find-storage-by-user.json'))
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

  if (body.query.includes('incrementUserUsedStorage')) {
    return gqlOkResponse(require('../../fixtures/increment-user-used-storage.json'))
  }

  if (body.query.includes('updateContentDagSize')) {
    return gqlOkResponse(require('../../fixtures/update-content-dag-size.json'))
  }

  return gqlResponse(400, {
    errors: [{ message: `unexpected query: ${body.query}` }]
  })
}
