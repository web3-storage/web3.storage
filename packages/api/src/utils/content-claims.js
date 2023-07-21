import { Assert } from '@web3-storage/content-claims/capability'
import { connect, CAR, HTTP } from '@web3-storage/content-claims/client'
import * as Link from 'multiformats/link'
import * as raw from 'multiformats/codecs/raw'
import { Map as LinkMap } from 'lnmap'
import * as CARIndex from './car-index.js'

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
   * Also creates CARv2 indexes for each claim and attaches the index as a
   * block in the claim.
   *
   * @param {import('multiformats').UnknownLink} root
   * @param {import('multiformats').Link} part
   * @param {Map<string, Set<string>>} linkIndex
   * @param {Map<import('multiformats').UnknownLink, number>} blockOffsets
   */
  createRelationClaimsWithIndexes (root, part, linkIndex, blockOffsets) {
    return createRelationClaimsWithIndexes(this._conf, root, part, linkIndex, blockOffsets)
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
      location: [location.toString()]
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
 * @param {import('multiformats').UnknownLink} content
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
 * @param {Map<string, Set<string>>} linkIndex
 * @param {Map<import('multiformats').UnknownLink, number>} blockOffsets
 */
export function createRelationClaimsWithIndexes (conf, root, part, linkIndex, blockOffsets) {
  /** @type {Array<[import('multiformats').UnknownLink, import('multiformats').UnknownLink[]]>} */
  const items = []
  for (const [cidstr, links] of linkIndex) {
    const cid = Link.parse(cidstr)
    if (!blockOffsets.has(cid)) continue

    const isRoot = root.toString() === cid.toString()
    if (cid.code === raw.code && !isRoot) continue

    const children = [...links].map(l => Link.parse(l)).filter(l => blockOffsets.has(l))
    if (!children.length && !isRoot) continue
    items.push([cid, children])
  }

  return Promise.all(items.map(async ([cid, children]) => {
    const offset = blockOffsets.get(cid)
    if (!offset) throw new Error('block offset disappeared')

    /** @type {Map<import('multiformats').UnknownLink, number>} */
    const childOffsets = new LinkMap()
    for (const cid of children) {
      const offset = blockOffsets.get(cid)
      if (!offset) continue
      childOffsets.set(cid, offset)
    }

    const index = await CARIndex.encode([[cid, offset], ...childOffsets])
    const claim = createRelationClaim(conf, cid, children, [{ content: part, includes: index.cid }])
    claim.attach(index)
    return claim
  }))
}
