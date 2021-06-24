const fs = require('fs')
const path = require('path')
const { CID } = require('multiformats')

module.exports = async ({ params }) => {
  const { cid } = params
  if (!isValisCid(cid)) {
    return {
      statusCode: 400,
      body: null,
    }
  }
  if (cid !== 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e') {
    // echo -n 'hello world' | ipfs add --cid-version 1
    // bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e
    return {
      statusCode: 404,
      body: null,
    }
  }
  return {
    statusCode: 200,
    buffer: true,
    headers: {
      'Content-Type': 'application/car',
    },
    body: fs.readFileSync(path.join(__dirname, '../../fixtures/hello.car')),
  }
}

function isValisCid(str) {
  try {
    const cid = CID.parse(str)
    return true
  } catch {
    return false
  }
}
