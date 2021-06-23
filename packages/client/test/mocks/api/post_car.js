const { CarReader } = require('@ipld/car')

/**
 * I return the cid for roots[0] in a car, and the size of that block! not the full dag size if more than one block.
 *
 * https://github.com/sinedied/smoke#javascript-mocks
 * @typedef {{ buffer: Buffer, originalname: string }} MultrFile
 * @param {{ params: Record<string, string>, files: MultrFile[] }} request
 */
module.exports = async ({ body, headers }) => {
  const car = await CarReader.fromBytes(body)
  const [root] = await car.getRoots()
  const carRootCid = root.toString()
  // @ts-ignore
  const { cid, bytes } = await car.get(root)
  return {
    statusCode: 200,
    body: {
      ok: true,
      value: {
        cid: carRootCid,
        size: bytes.length,
      },
    },
  }
}
