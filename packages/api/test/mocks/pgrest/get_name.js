const { db } = require('./post_rpc#publish_name_record')

Object.assign(db, {
  k51qzi5uqu5dl2hq2hm5m29sdq1lum0kb0lmyqsowicmrmxzxywwgxhy6ymrdv:
    require('../../fixtures/postgres/find-name-by-key.json')
})

module.exports = ({ query }) => {
  const key = query.key.split('.').pop()
  if (db[key]) {
    return {
      statusCode: 200,
      body: [db[key]]
    }
  }
  return {
    statusCode: 500,
    body: { message: `unexpected key: ${key}` }
  }
}
