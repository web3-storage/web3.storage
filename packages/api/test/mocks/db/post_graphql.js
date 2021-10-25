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
    // validate filename is decoded
    const name = body.variables.data.name
    const decoded = decodeURIComponent(body.variables.data.name)
    if (name && name.includes('%') && !decoded.includes('%')) {
      return gqlResponse(500, {
        errors: [{ message: 'Filename was not decoded' }]
      })
    }

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
    if (cid === 'bafybeihgrtet4vowd4t4iqaspzclxajrwwsesur7zllkahrbhcymfh7kyi') {
      res = require('../../fixtures/find-content-by-cid-unknown.json')
    } else if (cid === 'bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4') {
      res = require('../../fixtures/find-content-by-cid-no-aggregate.json')
    } else if (cid === 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q') {
      res = require('../../fixtures/find-content-by-cid-no-deal.json')
    } else {
      res = require('../../fixtures/find-content-by-cid.json')
    }
    if (res.data.findContentByCid) {
      res.data.findContentByCid.cid = cid
    }
    return gqlResponse(200, res)
  }

  if (body.query.includes('findMetricByKey')) {
    return gqlOkResponse({ findMetricByKey: { value: 42 } })
  }

  if (body.query.includes('findUserByID')) {
    return gqlOkResponse(require('../../fixtures/find-storage-by-user.json'))
  }

  if (body.query.includes('findUploadsByUser')) {
    const size = body.variables.size
    const sortBy = body.variables.sortBy
    let res

    if (sortBy === 'Name') {
      res = require('../../fixtures/get-user-uploads/find-uploads-by-user-sorted-by-name.json')
    } else {
      res = require('../../fixtures/get-user-uploads/find-uploads-by-user.json')
    }
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
