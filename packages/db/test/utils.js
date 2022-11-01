import { sha256 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { PostgrestClient } from '@supabase/postgrest-js'
import { normalizeCid } from '../../api/src/utils/cid.js'
import { DBError } from '../errors.js'

export const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU'
export const dbEndpoint = 'http://127.0.0.1:3000'

export const initialPinsNotPinned = [{
  status: 'Pinning',
  location: {
    peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
    peerName: 'web3-storage-sv15',
    ipfsPeerId: '12D3KooWR19qPPiZH4khepNjS3CLXiB7AbrbAD4ZcDjN1UjGUNE1',
    region: 'region'
  }
}]

export const pinsPinned = [
  {
    status: 'Pinning',
    location: {
      peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
      peerName: 'web3-storage-sv15',
      region: 'region'
    }
  },
  {
    status: 'Pinned',
    location: {
      peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK7',
      peerName: 'web3-storage-sv16',
      region: 'region'
    }
  }
]

export const pinsError = [
  {
    status: 'PinError',
    location: {
      peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
      peerName: 'web3-storage-sv15',
      region: 'region'
    }
  },
  {
    status: 'PinError',
    location: {
      peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK7',
      peerName: 'web3-storage-sv16',
      region: 'region'
    }
  }
]

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
 * Create a user and files with a specified storage quota used.
 *
 * It creates some failed and yet to be pinned content.
 * @param {import('../index').DBClient} dbClient
 * @param {Object} [options]
 * @param {string} [options.email]
 * @param {number} [options.percentStorageUsed]
 * @param {number} [options.storageQuota]
 * @param {Array<Object>} [options.pins]
 * @returns {Promise.<import('../db-client-types').UserOutput>}
 */
export async function createUserWithFiles (dbClient, options = {}) {
  const {
    email,
    percentStorageUsed,
    storageQuota = 1099511627776,
    pins
  } = options

  const user = await createUser(dbClient, {
    email,
    name: email.replace('@email.com', '-name')
  })

  if (storageQuota !== 1099511627776) {
    // non-default storage quota
    await dbClient.createUserTag(Number(user._id), {
      tag: 'StorageLimitBytes',
      value: storageQuota.toString()
    })
  }

  const authKey = await createUserAuthKey(dbClient, Number(user._id), {
    name: `${email}-key`
  })

  const uploads = 5
  const pinRequests = 3
  const dagSize = Math.ceil(((percentStorageUsed / 100) * storageQuota) / (uploads + pinRequests))

  for (let i = 0; i < uploads; i++) {
    const cid = await randomCid()
    await createUpload(dbClient, Number(user._id), Number(authKey), cid, {
      dagSize
    })
  }

  for (let i = 0; i < pinRequests; i++) {
    const cid = await randomCid()
    await createPsaPinRequest(dbClient, authKey, cid, {
      dagSize,
      pins: pins || pinsPinned
    })
  }

  return user
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

/**
 * @param {import('../index').DBClient} dbClient
 * @param {number} user
 * @param {number} [authKey]
 * @param {string} [cid]
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
    contentCid: cid || await randomCid(),
    sourceCid: cid || await randomCid(),
    authKey: authKey,
    type: options.type || 'Upload',
    dagSize: options.dagSize === undefined ? 1000 : options.dagSize,
    name: options.name || `Upload_${new Date().toISOString()}`,
    pins: options.pins || pinsPinned,
    backupUrls: options.backupUrls || [initialBackupUrl]
  })

  return dbClient.getUpload(cid, user)
}

/**
 * @param {import('../index').DBClient} dbClient
 * @param {string} authKey
 * @param {string} cid
 * @param {Object} [options]
 * @param {number} [options.dagSize]
 * @param {*} [options.origins]
 * @param {*} [options.meta]
 * @param {Array<Object>} [options.pins]
 */
export async function createPsaPinRequest (dbClient, authKey, cid, options = {}) {
  await dbClient.createPsaPinRequest({
    authKey,
    sourceCid: cid,
    contentCid: normalizeCid(cid),
    dagSize: options.dagSize || 1000,
    origins: options.origins || null,
    meta: options.meta || null,
    pins: options.pins || []
  })
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
 * @param {import('../index').DBClient} dbClient
 * @param {string} userId
 * @param {import('../index').PageRequest} pageRequest
 */
export async function listUploads (dbClient, userId, pageRequest) {
  return dbClient.listUploads(userId, pageRequest)
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
export async function createCargoDag (dbClient, dag = {}, source = {}) {
  const now = new Date()
  const cidV1 = await randomCid()

  const dagData = {
    cid_v1: cidV1,
    size_actual: Math.ceil(Math.random() * 100000),
    entry_created: now,
    entry_analyzed: now,
    entry_last_updated: now,
    ...dag
  }

  const dagSourceData = {
    cid_v1: cidV1,
    source_key: cidV1,
    size_claimed: Math.ceil(Math.random() * 100000),
    entry_created: now,
    entry_last_updated: now,
    srcid: 1, // This assumes a cargo.sources has been initialised with a row.
    ...source
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

  const { error: errorSources } = await client
    .from('dag_sources')
    .upsert(dagSourceData)

  if (error) {
    console.error(error)
  }

  if (errorSources) {
    console.error(errorSources)
  }
}

/**
 * Get contents from cids
 *
 * @param {string[]} cids
 */
export async function getContents (dbClient, cids) {
  const { data, error } = await dbClient._client
    .from('content')
    .select()
    .in('cid', cids)
  if (error) {
    throw new DBError(error)
  }
  return data
}
