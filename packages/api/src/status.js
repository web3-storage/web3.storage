import { gql } from '@web3-storage/db'
import { JSONResponse, notFound } from './utils/json-response.js'

const DEAL_STATUS = new Set([
  'Queued',
  'Published',
  'Active'
])

const PIN_STATUS = new Set([
  'Pinned',
  'Pinning',
  'PinQueued'
])

/**
 * Returns pin and deal status info for a given CID.
 *
 * @see {@link ../test/fixtures/status.json|Exmple resonse}
 * @param {Request} request
 * @param {import('./env').Env} env
 * @returns {Response}
 */
export async function statusGet (request, env) {
  const cid = request.params.cid
  const result = await env.db.query(
    gql`query FindContentByCid($cid: String!) {
      findContentByCid(cid: $cid) {
        dagSize
        batchEntries {
          data {
            dataModelSelector
            batch {
              cid
              pieceCid
              deals {
                data {
                  miner
                  chainDealId
                  activation
                  status
                }
              }
            }
          }
        }
        pins {
          data {
            status
            location {
              peerId
              peerName
              region
            }
          }
        }
      }
    }
  `, { cid })

  const { findContentByCid: raw } = result.data
  const { dagSize } = raw

  if (raw.pins.data.length === 0 && raw.batchEntries.data.length === 0) {
    return notFound()
  }

  const pins = raw.pins.data
    .filter(({ status }) => PIN_STATUS.has(status))
    .map(({ status, location }) => ({ status, ...location }))

  const deals = raw.batchEntries.data.map(({ dataModelSelector, batch }) => {
    const { pieceCid, cid: dataCid, deals } = batch
    if (deals.data.length === 0) {
      return [{
        status: 'Queued',
        pieceCid,
        dataCid,
        dataModelSelector
      }]
    }
    return deals.data
      .filter(({ status }) => DEAL_STATUS.has(status))
      .map(({ chainDealId: dealId, miner, activation, status }) => ({
        dealId,
        miner,
        status,
        activation,
        pieceCid,
        dataCid,
        dataModelSelector
      }))
  }).reduce((a, b) => a.concat(b), []) // flatten array of arrays.

  const status = {
    cid,
    dagSize,
    pins,
    deals
  }

  return new JSONResponse(status)
}
