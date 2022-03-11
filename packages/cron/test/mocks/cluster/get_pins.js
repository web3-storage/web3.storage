/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {{ query: Record<string, string|string[]> }} request
 */
module.exports = async ({ query }) => {
  const cids = query.cids ? query.cids.split(',') : []
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: cids.map(cid => {
      const peerMap = {
        'test-peer-id': {
          peername: 'test-peer-name',
          ipfs_peer_id: 'test-ipfs-peer-id',
          status: 'pinned',
          timestamp: new Date().toISOString()
        }
      }
      if (cid === 'bafy1') {
        peerMap['test-peer-id-2'] = {
          peername: 'test-peer-name-2',
          ipfs_peer_id: 'test-ipfs-peer-id-2',
          status: 'pinned',
          timestamp: new Date().toISOString()
        }
      }
      return {
        cid: { '/': cid },
        name: 'test-pin-name',
        peer_map: peerMap
      }
    })
  }
}
