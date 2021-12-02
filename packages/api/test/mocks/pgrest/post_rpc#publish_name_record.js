const db = {}

module.exports = ({ body }) => {
  db[body.data.key] = body.data
  return {
    statusCode: 200,
    body: {}
  }
}

module.exports.db = db
