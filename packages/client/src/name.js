/**
 * This module exists only to provide maintain the existing functionality to allow a
 * smooth transition to the new 'w3name' package. This module will be later removed.
 */
import * as w3name from 'w3name'

console.warn('The name.js module is deprecated. You should use the new \'w3name\' npm package instead.')

export const {
  Name,
  WritableName,
  create,
  parse,
  from,
  v0,
  increment,
  Revision
} = w3name

/**
 * @typedef {{
 *   sign (data: Uint8Array): Promise<Uint8Array>
 * }} SigningKey
 *
 * @typedef {{
 *   endpoint: URL
 *   rateLimiter?: function
 * }} PublicService
 */

/* eslint-disable no-unused-vars */

/**
 * Proxy the old `publish` function arguments through to the new version.
 *
 * @param {import('./lib/interface.js').Service} service
 * @param {w3name.Revision} revision Revision of record to publish.
 * @param {SigningKey} key Private key to sign the record with.
 */
// @ts-expect-error
export async function publish (service, revision, key) {
  // The user _might_ have overridden the endpoint in the service, but it's unlikely and
  // this library is only really intended for use with the w3name endpoint anyway. The
  // most likely use case for overriding it is for tests, which other than for the e2e
  // test (which wants to use the real endpoint anyway), tests no longer exist for this
  // module because it's now just a proxy.
  // @ts-ignore key type is libp2p-crypto PrivateKey instead of SigningKey
  return await w3name.publish(revision, key)
}

/**
 * Proxy the old function arguments to the new version.
 * @param {PublicService} service
 * @param {w3name.Name} name The name to resolve.
 */
// @ts-expect-error
export async function resolve (service, name) {
  // Same reasoning as in `publish`, we ignore the `service` arg.
  return await w3name.resolve(name)
}
