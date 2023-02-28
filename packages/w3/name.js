import * as fs from 'fs'
import * as Name from 'w3name'
import * as uint8arrays from 'uint8arrays'
import { config } from './lib.js'

export async function create () {
  const name = await Name.create()
  config.set(`name.${name}`, uint8arrays.toString(name.key.bytes, 'base64pad'))
  console.log(name.toString())
}

export function list () {
  Object.keys(config.store.name || {}).forEach(keyId => console.log(keyId))
}

/**
 * Publish the given value as an IPNS record to w3name under the given key.
 * @param {string} keyId
 * @param {string} value
 */
export async function publish (keyId, value) {
  const b64SigningKey = config.get(`name.${keyId}`)
  if (!b64SigningKey) {
    throw new Error('missing signing key')
  }

  const name = await Name.from(uint8arrays.fromString(b64SigningKey, 'base64pad'))
  /** @type {Name.Revision} */
  let revision
  try {
    revision = await Name.resolve(name)
    revision = await Name.increment(revision, value)
  } catch (err) {
    if (!err.message.includes('not found')) throw err
    revision = await Name.v0(name, value)
  }

  await Name.publish(revision, name.key)
}

/**
 * Resolve the w3name record for the given key.
 * @param {string} keyId
 */
export async function resolve (keyId) {
  const name = Name.parse(keyId)
  const revision = await Name.resolve(name)
  console.log(revision.value)
}

/**
 * Retrieve the signing key associated with the given key and print it to the console.
 * @param {string} keyId
 */
export function exportKey (keyId) {
  const signingKey = config.get(`name.${keyId}`)
  if (!signingKey) {
    throw new Error('missing signing key for the provided <keyId>')
  }
  console.log(signingKey)
}

/**
 * Import the signing key from the given key file and store it in the config under its assocated
 * name.
 * @param {string} keyFile
 */
export async function importKey (keyFile) {
  let key
  try {
    key = fs.readFileSync(keyFile, 'utf8')
  } catch (err) {
    console.error(`Could not open specified key file: ${err}`)
    return
  }
  const keyId = await Name.from(uint8arrays.fromString(key.trim(), 'base64pad'))
  if (config.get(`name.${keyId}`)) {
    console.log(`Already have key stored for name: '${keyId}'.`)
    return
  }
  config.set(`name.${keyId}`, key)
  console.log(`Stored key for name: '${keyId}'.`)
}

/**
 * @param {string} keyId
 */
export function rm (keyId) {
  config.delete(`name.${keyId}`)
}
