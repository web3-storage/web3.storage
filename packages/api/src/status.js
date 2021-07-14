import { gql } from '@web3-storage/db'
import { JSONResponse } from './utils/json-response.js'

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

/*
returns:
```
{
  "cid": "bafy",
  "dagSize": 101,
  "pins": [{
    "peerId": "12D3KooWR1Js",
    "peerName": "who?",
    "region": "where?",
    "status": "Pinned"
  }],
  "deals": [{
    "dealId": 12345,
    "miner": "f99",
    "status": "active",
    "activation": "<iso timestamp>",
    "pieceCid":  "baga",
    "dataCid":  "bafy",
    "dataModelSelector": "Links/0/Links"
  }]
}
```
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
