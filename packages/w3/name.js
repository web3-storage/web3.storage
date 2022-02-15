import * as Name from 'web3.storage/name'
import * as uint8arrays from 'uint8arrays'
import { config, getClient } from './lib.js'

export async function create () {
  const name = await Name.create()
  config.set(`name.${name}`, uint8arrays.toString(name.key.bytes, 'base64pad'))
  console.log(name.toString())
}

export function list () {
  Object.keys(config.store.name || {}).forEach(keyId => console.log(keyId))
}

/**
 * @param {string} keyId
 * @param {string} value
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 */
export async function publish (keyId, value, opts) {
  const b64SigningKey = config.get(`name.${keyId}`)
  if (!b64SigningKey) {
    throw new Error('missing signing key')
  }

  const client = getClient(opts)
  const name = await Name.from(uint8arrays.fromString(b64SigningKey, 'base64pad'))
  /** @type {Name.Revision} */
  let revision
  try {
    revision = await Name.resolve(client, name)
    revision = await Name.increment(revision, value)
  } catch (err) {
    if (!err.message.includes('not found')) throw err
    revision = await Name.v0(name, value)
  }

  await Name.publish(client, revision, name.key)
}

/**
 * @param {string} keyId
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 */
export async function resolve (keyId, opts) {
  const name = Name.parse(keyId)
  const revision = await Name.resolve(getClient(opts), name)
  console.log(revision.value)
}

/**
 * @param {string} keyId
 */
export function rm (keyId) {
  config.delete(`name.${keyId}`)
}
