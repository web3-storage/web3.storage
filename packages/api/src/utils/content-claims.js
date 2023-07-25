import { Assert } from '@web3-storage/content-claims/capability'
import { connect, CAR, HTTP } from '@web3-storage/content-claims/client'
import * as raw from 'multiformats/codecs/raw'

/**
 * @typedef {{
 *   issuer: import('@ucanto/interface').Signer
 *   audience: import('@ucanto/interface').Principal
 *   proofs: import('@ucanto/interface').Proof[]
 * }} InvocationConfig
 */

export class Factory {
  /**
   * @param {import('@ucanto/interface').Signer} issuer
   * @param {import('@ucanto/interface').Proof[]} proofs
   * @param {import('@ucanto/interface').Principal} servicePrincipal
   * @param {URL} serviceURL
   */
  constructor (issuer, proofs, servicePrincipal, serviceURL) {
    this._conf = { issuer, audience: servicePrincipal, proofs }
    this._conn = connect({
      id: servicePrincipal,
      codec: CAR.outbound,
      channel: HTTP.open({ url: serviceURL, method: 'POST' })
    })
  }

  get connection () {
    return this._conn
  }

  /**
   * @param {import('multiformats').Link} content
   * @param {URL} location
   */
  createLocationClaim (content, location) {
    return createLocationClaim(this._conf, content, location)
  }

  /**
   * @param {import('multiformats').Link} content
   * @param {import('multiformats').Link} includes
   */
  createInclusionClaim (content, includes) {
    return createInclusionClaim(this._conf, content, includes)
  }

  /**
   * @param {import('multiformats').Link} content
   * @param {import('multiformats').Link[]} parts
   */
  createPartitionClaim (content, parts) {
    return createPartitionClaim(this._conf, content, parts)
  }

  /**
   * @param {import('multiformats').UnknownLink} content
   * @param {import('multiformats').UnknownLink[]} children
   * @param {Array<{ content: import('multiformats').Link, includes: import('multiformats').Link }>} parts
   */
  createRelationClaim (content, children, parts) {
    return createRelationClaim(this._conf, content, children, parts)
  }

  /**
   * Create relation claims for all indexed blocks that have children, plus one
   * for the root block, even if it does not have children.
   *
   * @param {import('multiformats').UnknownLink} root CID of the DAG root
   * @param {import('multiformats').Link} part CID of the CAR
   * @param {import('multiformats').Link} index CID of the index
   * @param {Map<import('multiformats').UnknownLink, Set<import('multiformats').UnknownLink>>} linkIndex
   */
  createRelationClaims (root, part, index, linkIndex) {
    return createRelationClaims(this._conf, root, part, index, linkIndex)
  }
}

/**
 * @param {InvocationConfig} conf
 * @param {import('multiformats').Link} content
 * @param {URL} location
 */
export function createLocationClaim (conf, content, location) {
  return Assert.location.invoke({
    issuer: conf.issuer,
    audience: conf.audience,
    with: conf.audience.did(),
    nb: {
      content,
      location: [/** @type {import('@ucanto/interface').URI} */(location.toString())]
    },
    expiration: Infinity,
    proofs: conf.proofs
  })
}

/**
 * @param {InvocationConfig} conf
 * @param {import('multiformats').Link} content
 * @param {import('multiformats').Link} includes
 */
export function createInclusionClaim (conf, content, includes) {
  return Assert.inclusion.invoke({
    issuer: conf.issuer,
    audience: conf.audience,
    with: conf.audience.did(),
    nb: { content, includes },
    expiration: Infinity,
    proofs: conf.proofs
  })
}

/**
 * @param {InvocationConfig} conf
 * @param {import('multiformats').Link} content
 * @param {import('multiformats').Link[]} parts
 */
export function createPartitionClaim (conf, content, parts) {
  return Assert.partition.invoke({
    issuer: conf.issuer,
    audience: conf.audience,
    with: conf.audience.did(),
    nb: { content, parts },
    expiration: Infinity,
    proofs: conf.proofs
  })
}

/**
 * @param {InvocationConfig} conf
 * @param {import('multiformats').UnknownLink[]} children
 * @param {Array<{ content: import('multiformats').Link, includes: import('multiformats').Link }>} parts
 */
export function createRelationClaim (conf, content, children, parts) {
  return Assert.relation.invoke({
    issuer: conf.issuer,
    audience: conf.audience,
    with: conf.audience.did(),
    nb: { content, children, parts },
    expiration: Infinity,
    proofs: conf.proofs
  })
}

/**
 * @param {InvocationConfig} conf
 * @param {import('multiformats').UnknownLink} root
 * @param {import('multiformats').Link} part
 * @param {import('multiformats').Link} index
 * @param {Map<import('multiformats').UnknownLink, Set<import('multiformats').UnknownLink>>} linkIndex
 */
export function createRelationClaims (conf, root, part, index, linkIndex) {
  const claims = []
  const parts = [{ content: part, includes: index }]
  for (const [cid, links] of linkIndex) {
    const isRoot = root.toString() === cid.toString()
    // do not create relation claim for raw CID, unless it is the root
    if (cid.code === raw.code && !isRoot) continue
    // only include the children known to have been indexed in this CAR
    const children = [...links].filter(l => linkIndex.has(l))
    claims.push(createRelationClaim(conf, cid, children, parts))
  }
  return claims
}
