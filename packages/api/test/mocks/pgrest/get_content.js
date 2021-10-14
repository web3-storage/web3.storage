/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {Request} request
 */
module.exports = ({ query }) => {
  const cid = query.cid && query.cid.split('eq.')[1]
  let res

  if (cid === 'unknown') {
    res = null
  } else if (cid === 'noaggregate') {
    res = require('../../fixtures/postgres/find-content-by-cid-no-aggregate.json')
  } else if (cid === 'nodeal') {
    res = require('../../fixtures/postgres/find-content-by-cid-no-deal.json')
  } else {
    res = require('../../fixtures/postgres/find-content-by-cid.json')
  }
  if (res) {
    res.cid = cid
  }
  return res
}
