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
 * @see {@link ../test/fixtures/status.json|Example response}
 * @param {Request} request
 * @param {import('./env').Env} env
 * @returns {Response}
 */
export async function statusGet (request, env) {
  const cid = request.params.cid
  const result = await env.db.query(
    gql`query FindContentByCid($cid: String!) {
      findContentByCid(cid: $cid) {
        created
        dagSize
        aggregateEntries {
          data {
            dataModelSelector
            aggregate {
              cid
              pieceCid
              deals {
                data {
                  miner
                  dealId
                  status
                  activation
                  created
                  updated
                }
              }
            }
          }
        }
        pins {
          data {
            status
            updated
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

  const { findContentByCid: raw } = result

  if (!raw) {
    return notFound()
  }

  const pins = raw.pins.data
    .filter(({ status }) => PIN_STATUS.has(status))
    .map(({ status, updated, location }) => ({ status, updated, ...location }))

  const deals = raw.aggregateEntries.data.map(({ dataModelSelector, aggregate }) => {
    const { pieceCid, dataCid, deals } = aggregate
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
      .map(({ dealId, miner, status, activation, created, updated }) => ({
        dealId,
        miner,
        status,
        pieceCid,
        dataCid,
        dataModelSelector,
        activation,
        created,
        updated
      }))
  }).reduce((a, b) => a.concat(b), []) // flatten array of arrays.

  const { dagSize, created } = raw

  const status = {
    cid,
    created,
    dagSize,
    pins,
    deals
  }

  return new JSONResponse(status)
}
