const db = {}

module.exports = ({ params, body }) => {
  db[params.key] = body
  return {
    statusCode: 200,
    body: {}
  }
}

module.exports.db = db
