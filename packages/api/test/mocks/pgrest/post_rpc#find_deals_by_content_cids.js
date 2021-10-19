/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {{ body: Request }} request
 */
module.exports = ({ body }) => {
  // main cid
  if (body.cids.includes('testcid')) {
    return [{
      dealId: 12345,
      storageProvider: 'f99',
      status: 'Active',
      pieceCid: 'baga',
      dataCid: 'testcid',
      dataModelSelector: 'Links/0/Links',
      activation: '<iso timestamp>',
      created: '2021-07-14T19:27:14.934572Z',
      updated: '2021-07-14T19:27:14.934572Z'
    }]
  } else if (body.cids.includes('nodeal')) {
    return [{
      status: 'Queued',
      pieceCid: 'baga',
      dataCid: 'nodeal',
      dataModelSelector: 'Links/0/Links'
    }]
  }
  return []
}
