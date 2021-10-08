import { PostgrestClient } from '@supabase/postgrest-js'
import { GraphQLClient, gql } from 'graphql-request'

import { normalizeUpload, normalizeContent, normalizePins } from './utils.js'
import { DBError } from './errors.js'

const ENDPOINT = 'https://graphql.fauna.com/graphql'

// TODO: Deprecate with fauna
export { gql }

const uploadQuery = `
        id,
        type,
        name,
        inserted_at,
        updated_at,
        content(cid, dag_size, pins:pin(status, updated_at, pin_location(id, peer_id, peer_name, region)))
      `
/**
 * @typedef {import('./postgres/db-types').definitions} definitions
 */

export class DBClient {
  constructor ({ endpoint = ENDPOINT, token, postgres = false }) {
    if (postgres) {
      this.client = new PostgrestClient(endpoint, {
        headers: {
          apikey: token
        }
      })
    } else {
      this._client = new GraphQLClient(endpoint, {
        fetch: globalThis.fetch,
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  }

  /**
   * Upsert user.
   *
   * @param {import('./db-client-types').UpsertUserInput} user
   * @return {import('./db-client-types').UpsertUserOutput}
   */
  async upsertUser (user) {
    /** @type {{ data: definitions['user'], error: Error }} */
    const { data, error } = await this.client
      .from('user')
      .upsert({
        id: user.id,
        name: user.name,
        picture: user.picture,
        email: user.email,
        issuer: user.issuer,
        github: user.github,
        public_address: user.publicAddress
      })
      .single()

    if (error) {
      throw new DBError(error)
    }

    return {
      issuer: data.issuer
    }
  }

  /**
   * Get user by its issuer.
   *
   * @param {string} issuer
   * @return {Promise<import('./db-client-types').UserOutput>}
   */
  async getUser (issuer) {
    /** @type {{ data: import('./db-client-types').User, error: Error }} */
    const { data, error } = await this.client
      .from('user')
      .select(`
        id,
        issuer,
        name,
        email,
        public_address,
        inserted_at,
        updated_at
      `)
      .eq('issuer', issuer)
      .single()

    if (error) {
      throw new DBError(error)
    }

    return {
      id: data.id,
      issuer: data.issuer,
      name: data.name,
      email: data.email,
      publicAddress: data.public_address,
      created: data.inserted_at,
      updated: data.updated_at
    }
  }

  /**
   * Get used storage in bytes.
   *
   * @param {number} userId
   * @returns {Promise<number>}
   */
  async getUsedStorage (userId) {
    /** @type {{ data: number, error: Error }} */
    const { data, error } = await this.client.rpc('user_used_storage', { query_user_id: userId })

    if (error) {
      throw new DBError(error)
    }

    return data || 0 // No uploads for the user
  }

  /**
   * Create upload with content and pins.
   *
   * @param {import('./db-client-types').CreateUploadInput} data
   * @returns {Promise<import('./db-client-types').CreateUploadOutput>}
   */
  async createUpload (data) {
    const now = new Date().toISOString()
    /** @type {{ data: import('./db-client-types').UploadOutput, error: Error }} */
    const { data: uploadResponse, error } = await this.client.rpc('create_upload', {
      data: {
        user_id: data.user,
        auth_key_id: data.authKey,
        content_cid: data.contentCid,
        source_cid: data.sourceCid,
        type: data.type,
        name: data.name,
        dag_size: data.dagSize,
        inserted_at: data.created || now,
        updated_at: data.updated || now,
        pins: data.pins.map(pin => ({
          status: pin.status,
          location: {
            peer_id: pin.location.peerId,
            peer_name: pin.location.peerName,
            region: pin.location.region
          }
        })),
        backup_urls: data.backupUrls
      }
    }).single()

    if (error) {
      throw new DBError(error)
    }

    return {
      id: uploadResponse.id,
      cid: uploadResponse.content_cid
    }
  }

  /**
   * Get upload with user, auth_keys, content and pins.
   *
   * @param {string} cid
   * @param {number} userId
   * @returns {Promise<import('./db-client-types').UploadItemOutput>}
   */
  async getUpload (cid, userId) {
    /** @type {{ data: import('./db-client-types').UploadItem, error: Error }} */
    const { data: upload, error } = await this.client
      .from('upload')
      .select(uploadQuery)
      .eq('content_cid', cid)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new DBError(error)
    }

    const deals = await this.getDeals(cid)

    return {
      ...normalizeUpload(upload),
      deals
    }
  }

  /**
   * List uploads of a given user.
   *
   * @param {number} userId
   * @param {import('./db-client-types').ListUploadsOptions} [opts]
   * @returns {Promise<Array<import('./db-client-types').UploadItemOutput>>}
   */
  async listUploads (userId, opts = {}) {
    let query = this.client
      .from('upload')
      .select(uploadQuery)
      .eq('user_id', userId)
      .limit(opts.size || 10)
      .order(
        opts.sortBy === 'Name' ? 'name' : 'inserted_at',
        { ascending: opts.sortOrder === 'Asc' }
      )

    if (opts.before) {
      query = query.lt('inserted_at', opts.before)
    }

    if (opts.after) {
      query = query.gte('inserted_at', opts.after)
    }

    /** @type {{ data: Array<import('./db-client-types').UploadItem>, error: Error }} */
    const { data: uploads, error } = await query

    if (error) {
      throw new DBError(error)
    }

    // Get deals
    const cids = uploads?.map((u) => u.content_cid)
    const deals = await this.getDealsForCids(cids)

    return uploads?.map((u) => ({
      ...normalizeUpload(u),
      deals: deals[u.content_cid] || []
    }))
  }

  /**
   * Rename an upload.
   *
   * @param {string} cid
   * @param {number} userId
   */
  async renameUpload (cid, userId, name) {
    /** @type {{ data: import('./db-client-types').UploadItem, error: Error }} */
    const { data, error } = await this.client
      .from('upload')
      .update({ name })
      .match({
        user_id: userId,
        content_cid: cid
      })
      .single()

    if (error) {
      throw new DBError(error)
    }

    return {
      name: data.name
    }
  }

  /**
   * Delete a user upload.
   *
   * @param {string} cid
   * @param {number} userId
   */
  async deleteUpload (cid, userId) {
    /** @type {{ data: import('./db-client-types').UploadItem, error: Error }} */
    const { data, error } = await this.client
      .from('upload')
      .delete()
      .match({
        content_cid: cid,
        user_id: userId
      })

    if (error) {
      throw new DBError(error)
    }

    return {
      _id: data.id
    }
  }

  /**
   * Get content status of a given cid.
   *
   * @param {string} cid
   * @returns {Promise<import('./db-client-types').ContentItemOutput>}
   */
  async getStatus (cid) {
    /** @type {{ data: import('./db-client-types').ContentItem, error: Error }} */
    const { data, error } = await this.client
      .from('content')
      .select(`
        cid,
        dag_size,
        inserted_at,
        pins:pin(status, updated_at, pin_location(peer_id, peer_name, region))
      `)
      .match({ cid })
      .single()

    if (error) {
      throw new DBError(error)
    }

    const deals = await this.getDeals(cid)

    return {
      ...normalizeContent(data),
      deals
    }
  }

  /**
   * Get backups for a given upload.
   *
   * @param {number} uploadId
   * @return {Promise<Array<import('./db-client-types').BackupOutput>>}
   */
  async getBackups (uploadId) {
    /** @type {{ data: Array<definitions['backup']>, error: Error }} */
    const { data: backups, error } = await this.client
      .from('backup')
      .select('*')
      .match({ upload_id: uploadId })

    if (error) {
      throw new DBError(error)
    }

    return backups.map(b => ({
      id: b.id,
      created: b.inserted_at,
      uploadId: b.upload_id,
      url: b.url
    }))
  }

  /**
   * Get Pins for a cid
   *
   * @param {string} cid
   * @return {Promise<Array<import('./db-client-types').PinItemOutput>>}
   */
  async getPins (cid) {
    /** @type {{ data: Array<import('./db-client-types').PinItem>, error: Error }} */
    const { data: pins, error } = await this.client
      .from('pin')
      .select(`
        id,
        status,
        inserted_at,
        updated_at,
        pin_location(id, peer_id, peer_name, region)
      `)
      .match({ content_cid: cid })

    if (error) {
      throw new DBError(error)
    }

    return normalizePins(pins)
  }

  /**
   * Get deals for a cid
   *
   * @param {string} cid
   * @return {Promise<import('./db-client-types').Deal[]>}
   */
  async getDeals (cid) {
    const deals = await this.getDealsForCids([cid])
    return deals[cid] ? deals[cid] : []
  }

  /**
   * Get deals for multiple cids
   *
   * @param {string[]} cids
   * @return {Promise<Record<string, import('./db-client-types').Deal[]>>}
   */
  async getDealsForCids (cids = []) {
    /** @type {{ data: Array<import('./db-client-types').Deal>, error: Error }} */
    const { data, error } = await this.client
      .rpc('find_deals_by_content_cids', {
        cids
      })

    if (error) {
      throw new DBError(error)
    }

    // TODO: normalize deal by removing deal prefix on dealActivation and dealExpiration
    const result = {}
    for (const d of data) {
      const { dataCid: cid, ...rest } = d
      if (!Array.isArray(result[cid])) {
        result[cid] = [rest]
      } else {
        result[cid].push(rest)
      }
    }

    return result
  }

  /**
   * Create a new auth key.
   *
   * @param {import('./db-client-types').CreateAuthKeyInput} key
   * @return {Promise<import('./db-client-types').CreateAuthKeyOutput>}
   */
  async createKey ({ name, secret, user }) {
    /** @type {{ data: definitions['auth_key'], error: Error }} */
    const { data, error } = await this.client
      .from('auth_key')
      .insert({
        name: name,
        secret: secret,
        user_id: user
      })
      .single()

    if (error) {
      throw new DBError(error)
    }

    return {
      _id: data.id
    }
  }

  /**
   * Get key with issuer and secret.
   *
   * @param {string} issuer
   * @param {string} secret
   * @return {Promise<import('./db-client-types').AuthKey>}
   */
  async getKey (issuer, secret) {
    /** @type {{ error: Error } */
    const { data, error } = await this.client
      .from('user')
      .select(`
        id,
        issuer,
        keys:auth_key_user_id_fkey(id, name,secret)
      `)
      .match({
        issuer
      })
      .filter('keys.deleted_at', 'is', null)
      .single()

    if (error) {
      throw new DBError(error)
    }

    const key = data.keys.find(k => k.secret === secret)

    if (!key) {
      throw new Error('user has no key with given secret')
    }

    return {
      _id: key.id,
      name: key.name,
      user: {
        _id: data.id,
        issuer: data.issuer
      }
    }
  }

  /**
   * List auth keys of a given user.
   *
   * @param {number} userId
   * @return {Promise<Array<import('./db-client-types').AuthKeyItemOutput>>}
   */
  async listKeys (userId) {
    /** @type {{ error: Error, data: Array<import('./db-client-types').AuthKeyItem> }} */
    const { data, error } = await this.client
      .from('auth_key')
      .select(`
        id,
        name,
        secret,
        inserted_at,
        uploads:upload(id)
      `)
      .match({ user_id: userId })
      .is('deleted_at', null)

    if (error) {
      throw new DBError(error)
    }

    return data.map(k => ({
      _id: k.id,
      name: k.name,
      secret: k.secret,
      created: k.inserted_at,
      hasUploads: Boolean(k.uploads.length)
    }))
  }

  /**
   * Delete auth key with given id.
   *
   * @param {number} userId
   * @param {number} keyId
   */
  async deleteKey (userId, keyId) {
    // Fauna Fallback
    if (!this.client) {
      return this._client.deleteKey(id)
    }

    /** @type {{ error: Error }} */
    const { error } = await this.client
      .from('auth_key')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .match({
        id: keyId,
        user_id: userId
      })

    if (error) {
      throw new DBError(error)
    }
  }

  /**
   * @template T
   * @template V
   * @param {import('graphql-request').RequestDocument} document
   * @param {V} variables
   * @returns {Promise<T>}
   */
  query (document, variables) {
    if (!this._client) {
      throw new Error('fauna database not setup')
    }
    return this._client.request(document, variables)
  }
}
