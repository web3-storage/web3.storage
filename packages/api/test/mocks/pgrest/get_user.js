
/**
 * https://github.com/sinedied/smoke#javascript-mocks
 */
module.exports = data => {
  const issuer = data.query.issuer && data.query.issuer.split('eq.')[1]
  let user

  if (issuer === 'user-pinning-enabled') {
    user = {
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
  } else {
    user = {
      id: 1,
      issuer: 'issuer-str',
      pinningEnabled: false,
      keys: [
        {
          id: 1,
          name: 'test-key',
          secret: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaXNzIjoid2ViMy1zdG9yYWdlIiwiaWF0IjoxNjMzOTU3Mzg5ODcyLCJuYW1lIjoidGVzdCJ9.KEH0jHUfJls44YWsj8uex_zj0dUIvdyqGalv2rhWnx8'
        }
      ]
    }
  }

  return user
}
