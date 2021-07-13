const fs = require('fs')
const path = require('path')
const { CID } = require('multiformats')

const fixtures = {
  bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e:
    '../../fixtures/hello-world.car',
  bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu:
    '../../fixtures/dir.car'
}

module.exports = async ({ params }) => {
  const { cid } = params
  if (!isValisCid(cid)) {
    return {
      statusCode: 400,
      body: null
    }
  }
  const carPath = fixtures[cid]
  if (!carPath) {
    return {
      statusCode: 404,
      body: null
    }
  }
  return {
    statusCode: 200,
    buffer: true,
    headers: {
      'Content-Type': 'application/car'
    },
    body: fs.readFileSync(path.join(__dirname, carPath))
  }
}

function isValisCid (str) {
  try {
    CID.parse(str)
    return true
  } catch {
    return false
  }
}
