/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @typedef {{ buffer: Buffer, originalname: string }} MultrFile
 * @param {{ query: Record<string, string>, body: any }} request
 */
module.exports = async ({ query, body }) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: body // lololol echo
  }
}
