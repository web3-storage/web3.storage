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
   * @param {import('multiformats').UnknownLink} ancestor
   */
  createDescendantClaim (content, ancestor) {
    return createDescendantClaim(this._conf, content, ancestor)
  }

  /**
   * Create descendant claims for all descendants that have children.
   *
   * @param {import('multiformats').UnknownLink[]} contents
   * @param {import('multiformats').UnknownLink} ancestor
   */
  createDescendantClaims (contents, ancestor) {
    return createDescendantClaims(this._conf, contents, ancestor)
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
 * @param {import('multiformats').UnknownLink} content
 * @param {import('multiformats').UnknownLink} ancestor
 */
export function createDescendantClaim (conf, content, ancestor) {
  return Assert.descendant.invoke({
    issuer: conf.issuer,
    audience: conf.audience,
    with: conf.audience.did(),
    nb: { content, ancestor },
    expiration: Infinity,
    proofs: conf.proofs
  })
}

/**
 * @param {InvocationConfig} conf
 * @param {import('multiformats').UnknownLink[]} contents
 * @param {import('multiformats').UnknownLink} ancestor
 */
export function createDescendantClaims (conf, contents, ancestor) {
  const claims = []
  for (const cid of contents) {
    if (cid.code === raw.code || ancestor.toString() === cid.toString()) {
      continue
    }
    claims.push(createDescendantClaim(conf, cid, ancestor))
  }
  return claims
}
