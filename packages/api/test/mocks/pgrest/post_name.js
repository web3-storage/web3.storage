const db = {}

module.exports = ({ body }) => {
  db[body.key] = body
  return {
    statusCode: 200,
    body: {}
  }
}

module.exports.db = db
