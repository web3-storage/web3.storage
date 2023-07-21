import http from 'http'
import { Map as LinkMap } from 'lnmap'
import * as CAR from '@ucanto/transport/car'
import * as Claims from '@web3-storage/content-claims/server'

/** @typedef {import('@web3-storage/content-claims/server/api').ClaimStore} ClaimStore */

/** @implements {ClaimStore} */
export class Store {
  constructor () {
    /** @type {Map<import('@ucanto/server').UnknownLink, import('@web3-storage/content-claims/server/api').Claim[]>} */
    this.data = new LinkMap()
  }

  /** @param {import('@web3-storage/content-claims/server/api').Claim} claim */
  async put (claim) {
    const claims = this.data.get(claim.content) ?? []
    claims.push(claim)
    this.data.set(claim.content, claims)
  }

  /** @param {import('@ucanto/server').UnknownLink} content */
  async get (content) {
    return this.data.get(content) ?? []
  }

  clear () {
    this.data.clear()
  }
}

/**
 * @param {{ signer: import('@ucanto/interface').Signer, claimStore: ClaimStore, port: number }} conf
 * @returns {Promise<http.Server>}
 */
export const createHTTPServer = async ({ signer, claimStore, port }) => {
  const claimsServer = Claims.createServer({ id: signer, codec: CAR.inbound, claimStore })
  const httpServer = http.createServer(async (req, res) => {
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }

    const { status, headers, body } = await claimsServer.request({
      // @ts-expect-error not quite overlap but doesn't matter
      headers: req.headers,
      body: Buffer.concat(chunks)
    })

    res.writeHead(status ?? 200, headers)
    res.write(body)
    res.end()
  })

  return new Promise(resolve => httpServer.listen(port, () => resolve(httpServer)))
}
