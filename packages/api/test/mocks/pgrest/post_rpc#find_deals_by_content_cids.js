/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {{ body: Request }} request
 */
module.exports = ({ body }) => {
  // main cid
  if (body.cids.includes('bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm')) {
    return [{
      dealId: 12345,
      storageProvider: 'f99',
      status: 'Active',
      pieceCid: 'baga',
      dataCid: 'bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm',
      dataModelSelector: 'Links/0/Links',
      activation: '<iso timestamp>',
      created: '2021-07-14T19:27:14.934572Z',
      updated: '2021-07-14T19:27:14.934572Z'
    }]
  } else if (body.cids.includes('bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q')) {
    return [{
      status: 'Queued',
      pieceCid: 'baga',
      dataCid: 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q',
      dataModelSelector: 'Links/0/Links'
    }]
  }
  return []
}
