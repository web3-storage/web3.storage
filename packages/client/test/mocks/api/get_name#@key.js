const uint8arrays = require('uint8arrays')
const ipns = require('ipns')
const { db } = require('./post_name#@key')

module.exports = ({ params: { key } }) => {
  if (key === 'json-error') {
    return {
      statusCode: 500,
      body: { message: 'throw an error for the tests' }
    }
  }

  if (key === 'text-error') {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'throw an error for the tests'
    }
  }

  if (db[key]) {
    const entry = ipns.unmarshal(uint8arrays.fromString(db[key], 'base64pad'))
    return {
      statusCode: 200,
      body: {
        value: uint8arrays.toString(entry.value, 'base64pad'),
        record: db[key]
      }
    }
  }

  return {
    statusCode: 500,
    body: { message: `unexpected key: ${key}` }
  }
}
