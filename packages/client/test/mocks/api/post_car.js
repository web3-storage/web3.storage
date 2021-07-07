const { CarReader } = require('@ipld/car')

/**
 * I return the cid for roots[0] in a car, and the size of that block! not the full dag size if more than one block.
 *
 * https://github.com/sinedied/smoke#javascript-mocks
 * @typedef {{ buffer: Buffer, originalname: string }} MultrFile
 * @param {{ params: Record<string, string>, files: MultrFile[] }} request
 */
module.exports = async ({ body, headers }) => {
  if (!headers.authorization || headers.authorization === 'Bearer bad') {
    return {
      statusCode: !headers.authorization ? 401 : 403,
    }
  }
  let car
  try {
    car = await CarReader.fromBytes(body)
  } catch (err) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        message: 'Request body not a valid CAR file',
      },
    }
  }
  const [root] = await car.getRoots()
  const carRootCid = root.toString()

  // Testing Failure
  if (carRootCid === 'bafkreiexwhcktnzbtn2ops3qdqfljsh223uubnslqrexsfkqzppqsg6i6u') {
    return {
      statusCode: 400,
      body: {
        ok: false,
        message: 'Request body not a valid CAR file',
      },
    }
  }

  return {
    statusCode: 200,
    body: {
      ok: true,
      cid: carRootCid,
    },
  }
}
