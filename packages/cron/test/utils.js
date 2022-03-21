// TODO: this is a copy of packages/db/test/utils.js. Once this [PR](https://github.com/web3-storage/web3.storage/pull/1109) is merged we should use that instead.
import { DBClient } from '@web3-storage/db'

export const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU'

/**
 * @param {import('../../db/index').DBClient} dbClient
 * @param {Object} [options]
 * @param {string} [options.name]
 * @param {string} [options.email]
 * @param {string} [options.issuer]
 * @param {string} [options.publicAddress]
 * @return {Promise.<import('@web3-storage/db/db-client-types').UserOutput>}
 */
export async function createUser (dbClient, options = {}) {
  const issuer = options.issuer || `issuer${Math.random()}`
  await dbClient.upsertUser({
    name: options.name || 'test-name',
    email: options.email || 'test@email.com',
    issuer,
    publicAddress: options.publicAddress || `public_address${Math.random()}`
  })

  return dbClient.getUser(issuer)
}

/**
 * @param {import('../../db/index').DBClient} dbClient
 * @param {number} user
 * @param {Object} [options]
 * @param {string} [options.name]
 * @param {string} [options.secret]
 */
export async function createUserAuthKey (dbClient, user, options = {}) {
  const { _id } = await dbClient.createKey({
    name: options.name || 'test-key-name',
    secret: options.secret || 'test-secret',
    user
  })

  return _id
}

export const defaultPinData = [{
  status: 'Pinning',
  location: {
    peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
    peerName: 'web3-storage-sv15',
    ipfsPeerId: '12D3KooWR19qPPiZH4khepNjS3CLXiB7AbrbAD4ZcDjN1UjGUNE1',
    region: 'region'
  }
}]

/**
 * @param {import('../../db/index').DBClient} dbClient
 * @param {number} user
 * @param {number} authKey
 * @param {string} cid
 * @param {Object} [options]
 * @param {string} [options.type]
 * @param {number} [options.dagSize]
 * @param {string} [options.name]
 * @param {Array<Object>} [options.pins]
 * @param {Array<string>} [options.backupUrls]
 */
export async function createUpload (dbClient, user, authKey, cid, options = {}) {
  const initialBackupUrl = `https://backup.cid/${new Date().toISOString()}/${Math.random()}`

  await dbClient.createUpload({
    user: user,
    contentCid: cid,
    sourceCid: cid,
    authKey: authKey,
    type: options.type || 'Upload',
    dagSize: options.dagSize || 1000,
    name: options.name || `Upload_${new Date().toISOString()}`,
    pins: options.pins || defaultPinData,
    backupUrls: options.backupUrls || [initialBackupUrl]
  })

  return dbClient.getUpload(cid, user)
}
