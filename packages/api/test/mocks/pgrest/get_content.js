/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @param {Request} request
 */
module.exports = ({ query }) => {
  const cid = query.cid && query.cid.split('eq.')[1]
  let res

  if (cid === 'bafybeihgrtet4vowd4t4iqaspzclxajrwwsesur7zllkahrbhcymfh7kyi') {
    res = null
  } else if (cid === 'bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4') {
    res = require('../../fixtures/postgres/find-content-by-cid-no-aggregate.json')
  } else if (cid === 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q') {
    res = require('../../fixtures/postgres/find-content-by-cid-no-deal.json')
  } else {
    res = require('../../fixtures/postgres/find-content-by-cid.json')
  }
  if (res) {
    res.cid = cid
  }
  return res
}
