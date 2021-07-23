const { importer } = require('ipfs-unixfs-importer')

const block = {
  get: async cid => { throw new Error(`unexpected block API get for ${cid}`) },
  put: async () => { throw new Error('unexpected block API put') }
}

/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @typedef {{ buffer: Buffer, originalname: string }} MultrFile
 * @param {{ query: Record<string, string>, files: MultrFile[] }} request
 */
module.exports = async ({ files, query }) => {
  const results = []

  const options = {
    onlyHash: true,
    cidVersion: 1,
    rawLeaves: true
  }

  const candidateImports = files.map((f) => ({ content: f.buffer }))
  for await (const { cid } of importer(candidateImports, block, options)) {
    results.push({
      cid: {
        '/': cid.toString()
      }
    })
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: query['stream-channels'] === 'false' ? results : results[0]
  }
}
