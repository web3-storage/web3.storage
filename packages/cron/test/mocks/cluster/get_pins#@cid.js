/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {{ params: Record<string, string> }} request
 */
module.exports = async ({ params }) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      cid: { '/': params.cid },
      name: 'test-pin-name',
      peer_map: {
        'test-cluster-peer-id': {
          peername: 'test-peer-name',
          ipfs_peer_id: 'test-peer-id',
          status: 'pinned',
          timestamp: new Date().toISOString()
        }
      }
    }
  }
}
