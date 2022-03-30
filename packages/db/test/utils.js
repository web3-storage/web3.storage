import { sha256 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { PostgrestClient } from '@supabase/postgrest-js'

export const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU'
export const dbEndpoint = 'http://127.0.0.1:3000'

/**
 * @param {number} code
 * @returns {Promise<string>}
 */
export async function randomCid (code = pb.code) {
  const hash = await sha256.digest(Buffer.from(`${Math.random()}`))
  return CID.create(1, code, hash).toString()
}

/**
 * @param {import('../index').DBClient} dbClient
 * @param {Object} [options]
 * @param {string} [options.name]
 * @param {string} [options.email]
 * @param {string} [options.issuer]
 * @param {string} [options.publicAddress]
 * @return {Promise.<import('../db-client-types').UserOutput>}
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
 * @param {import('../index').DBClient} dbClient
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
 * @param {import('../index').DBClient} dbClient
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
    contentCid: cid || randomCid(),
    sourceCid: cid || randomCid(),
    authKey: authKey,
    type: options.type || 'Upload',
    dagSize: options.dagSize === undefined ? 1000 : options.dagSize,
    name: options.name || `Upload_${new Date().toISOString()}`,
    pins: options.pins || defaultPinData,
    backupUrls: options.backupUrls || [initialBackupUrl]
  })

  return dbClient.getUpload(cid, user)
}

/**
 *
 * @param {import('../index').DBClient} dbClient
 * @param {string} cid
 * @param {number} userId
 */
export async function getUpload (dbClient, cid, userId) {
  return dbClient.getUpload(cid, userId)
}

/**
 *
 * @param {import('../index').DBClient} dbClient
 * @param {string} userId
 * @param {import('../db-client-types').ListUploadsOptions} [listUploadOptions]
 *
 */
export async function listUploads (dbClient, userId, listUploadOptions) {
  return dbClient.listUploads(userId, listUploadOptions)
}

/**
 *
 * @param {import('../index').DBClient} dbClient
 */
export async function getPinSyncRequests (dbClient, size = 10) {
  return dbClient.getPinSyncRequests({ size })
}

/**
 *
 * @param {import('../index').DBClient} dbClient
 * @param {object} [data]
 * @param {string} [data.cid_v1]
 * @param {number} [data.size_actual]
 * @param {Date} [data.entry_created]
 * @param {Date?} [data.entry_analyzed]
 * @param {Date} [data.entry_last_updated]
 *
 */
export async function createCargoDag (dbClient, data = {}) {
  const now = new Date()
  const dagData = {
    cid_v1: await randomCid(),
    size_actual: Math.ceil(Math.random() * 100000),
    entry_created: now,
    entry_analyzed: now,
    entry_last_updated: now,
    ...data
  }

  // For analyzis_markers constraint on dags table
  if (dagData.size_actual === null || dagData.size_actual === undefined) {
    dagData.entry_analyzed = null
  }

  const client = new PostgrestClient(dbEndpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: '*/*'
    },
    schema: 'cargo'
  })

  const { error } = await client
    .from('dags')
    .upsert(dagData)

  if (error) {
    console.error(error)
  }
}
