
/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {Request} request
 */
module.exports = ({ query }) => {
  const issuer = query.issuer && query.issuer.split('eq.')[1]
  const user = {
    id: 2,
    issuer: 'user-pinning-enabled',
    pinningEnabled: true,
    keys: [
      {
        id: 2,
        name: 'test-key',
        secret: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXBpbm5pbmctZW5hYmxlZCIsImlzcyI6IndlYjMtc3RvcmFnZSIsImlhdCI6MTYzMzk1NzM4OTg3MiwibmFtZSI6InRlc3QifQ.vam_RKnrTa96FkAB5ZRTU6L2icxzzENN9eBIOsQ7FUs',
        deleted_at: null
      }
    ]
  }

  if (issuer === 'user-pinning-enabled') {
    user.pinningEnabled = true
  }

  return user
}
