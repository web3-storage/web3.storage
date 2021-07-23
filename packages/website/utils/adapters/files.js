/**
 *  @typedef {object} Upload
 *  @property {string} cid
 *  @property {string} created
 *  @property {string} name

 *  @property {Deal[]} deals
 *  @property {string|null} pinStatus
 *  @property {string|null} renewalBy

 *  @property {object} content
 *  @property {string} content.cid
 *  @property {number} content.dagSize
 *  @property {object} content.pins
 *  @property {Pin[]} content.pins.data
 *  @property {object} content.aggregateEntries
 *  @property {AggregateData[]} content.aggregateEntries.data
 *
 *  @typedef {object} AggregateData
 *  @property {object} aggregate
 *  @property {object} aggregate.deals
 *  @property {AggregateDeal[]} aggregate.deals.data
 *
 *  @typedef {object} AggregateDeal
 *  @property {string} storageProvider
 *  @property {string} renewal
 *  @property {Number} dealId
 *
 *  @typedef {object} Deal
 *  @property {string} link
 *  @property {string} storageProvider
 *
 *  @typedef {object} Pin
 *  @property {string} status
 */

/**
 * @param {Upload[]} uploads
 * @returns {Upload[]} uploads
 */
export default function adaptUploadData(uploads) {
  return uploads.map((upload) => {
    const deals = upload.content.aggregateEntries.data
      .map((data) => data.aggregate?.deals?.data.filter((deal) => !!deal.storageProvider))
      .flat()

    const allPinStatus = upload.content.pins.data.map(({ status }) => status).filter(status => !!status)

    const renewalBy = deals.reduce((prev, deal) => {
      const renewalDate = new Date(deal.renewal)

      if (prev === null) return renewalDate

      return renewalDate < prev ? renewalDate : prev
    }, deals.length ? new Date(deals[0].renewal) : null)

    return {
      ...upload,
      pinStatus: allPinStatus.length > 0 ? allPinStatus[0] : null,
      deals: deals.map(({ dealId, storageProvider }) => ({
        link: `https://filfox.info/en/deal/${dealId}`,
        storageProvider
      })),
      renewalBy: renewalBy
        ? renewalBy.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
          })
        : null
    }
  })
}
