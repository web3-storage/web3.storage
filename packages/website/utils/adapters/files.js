/**
 *  @typedef {object} Upload
 *  @property {string} cid
 *  @property {string} created
 *  @property {string} name

 *  @property {Miner[]} minersList
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
 *  @property {string} miner
 *  @property {string} renewal
 *  @property {Number} dealId
 * 
 *  @typedef {object} Miner
 *  @property {string} link
 *  @property {string} id
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
    const miners = upload.content.aggregateEntries.data
    .map((data) =>
      data.aggregate?.deals?.data.filter((miner) => !!miner.miner)
    )
    .flat();

    const allPinStatus = upload.content.pins.data.map(({ status }) => status).filter(status => !!status)

    const renewalBy = miners.reduce((prev, miner) => {
      const renewalDate = new Date(miner.renewal);

      if(prev === null) return renewalDate

      return renewalDate < prev ? renewalDate : prev;
    }, miners.length ? new Date(miners[0].renewal) : null);

    return {
      ...upload,
      pinStatus: allPinStatus.length > 0 ? allPinStatus[0] : null,
      minersList: miners.map(({ dealId, miner }) => ({
        link: `https://filfox.info/en/deal/${dealId}`,
        id: miner
      })),
      renewalBy: renewalBy ? renewalBy.toLocaleDateString(undefined, {
        day: 'numeric',
        month:'numeric',
        year: 'numeric',
      }) : null
    };
  })
}
