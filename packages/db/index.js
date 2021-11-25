import { PostgrestClient } from '@supabase/postgrest-js'

import { normalizeUpload, normalizeContent, normalizePins, normalizeDeals } from './utils.js'
import { DBError } from './errors.js'
import {
  getUserMetrics,
  getUploadMetrics,
  getPinMetrics,
  getPinStatusMetrics,
  getContentMetrics,
  getPinBytesMetrics
} from './metrics.js'

const uploadQuery = `
        _id:id::text,
        type,
        name,
        created:inserted_at,
        updated:updated_at,
        content(cid, dagSize:dag_size, pins:pin(status, updated:updated_at, location:pin_location(_id:id, peerId:peer_id, peerName:peer_name, region)))
      `
/**
 * @typedef {import('./postgres/pg-rest-api-types').definitions} definitions
 * @typedef {import('@supabase/postgrest-js').PostgrestError} PostgrestError
 */

export class DBClient {
  constructor ({ endpoint, token }) {
    this._client = new PostgrestClient(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*'
      }
    })
  }

  /**
   * Upsert user.
   *
   * @param {import('./db-client-types').UpsertUserInput} user
   * @return {Promise<import('./db-client-types').UpsertUserOutput>}
   */
  async upsertUser (user) {
    /** @type {{ data: definitions['user'], error: PostgrestError }} */
    const { data, error } = await this._client
      .from('user')
      .upsert({
        id: user.id,
        name: user.name,
        picture: user.picture,
        email: user.email,
        issuer: user.issuer,
        github: user.github,
        public_address: user.publicAddress
      }, {
        onConflict: 'issuer'
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
    /** @type {{ data: import('./db-client-types').UserOutput, error: PostgrestError }} */
    const { data, error } = await this._client
      .from('user')
      .select(`
        _id:id::text,
        issuer,
        name,
        email,
        github,
        publicAddress:public_address,
        created:inserted_at,
        updated:updated_at
      `)
      .eq('issuer', issuer)
      .single()

    if (error) {
      throw new DBError(error)
    }

    return data
  }

  /**
   * Get used storage in bytes.
   *
   * @param {number} userId
   * @returns {Promise<number>}
   */
  async getUsedStorage (userId) {
    /** @type {{ data: string, error: PostgrestError }} */
    const { data, error } = await this._client.rpc('user_used_storage', { query_user_id: userId }).single()

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
    /** @type {{ data: string, error: PostgrestError }} */
    const { data: uploadResponse, error } = await this._client.rpc('create_upload', {
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
      _id: uploadResponse,
      cid: data.sourceCid
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
    /** @type {{ data: import('./db-client-types').UploadItem, error: PostgrestError }} */
    const { data: upload, error } = await this._client
      .from('upload')
      .select(uploadQuery)
      .eq('source_cid', cid)
      .eq('user_id', userId)
      .is('deleted_at', null)
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
    let query = this._client
      .from('upload')
      .select(uploadQuery)
      .eq('user_id', userId)
      .is('deleted_at', null)
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
    const cids = uploads?.map((u) => u.content.cid)
    const deals = await this.getDealsForCids(cids)

    return uploads?.map((u) => ({
      ...normalizeUpload(u),
      deals: deals[u.content.cid] || []
    }))
  }

  /**
   * Rename an upload.
   *
   * @param {number} userId
   * @param {string} cid
   * @param {string} name
   */
  async renameUpload (userId, cid, name) {
    /** @type {{ data: import('./db-client-types').UploadItem, error: PostgrestError }} */
    const { data, error } = await this._client
      .from('upload')
      .update({ name })
      .match({
        user_id: userId,
        source_cid: cid
      })
      .is('deleted_at', null)
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
   * @param {number} userId
   * @param {string} cid
   */
  async deleteUpload (userId, cid) {
    /** @type {{ data: import('./db-client-types').UploadItem, error: PostgrestError }} */
    const { data, error } = await this._client
      .from('upload')
      .update({
        deleted_at: new Date().toISOString()
      })
      .match({
        source_cid: cid,
        user_id: userId
      })
      .is('deleted_at', null)
      .single()

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
    /** @type {{ data: import('./db-client-types').ContentItem, error: PostgrestError }} */
    const { data, error } = await this._client
      .from('content')
      .select(`
        cid,
        dagSize:dag_size,
        created:inserted_at,
        pins:pin(status, updated:updated_at, location:pin_location(peerId:peer_id, peerName:peer_name, region))
      `)
      .match({ cid })
      .single()

    if (error) {
      throw new DBError(error)
    }

    if (!data) {
      return
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
    /** @type {{ data: Array<definitions['backup']>, error: PostgrestError }} */
    const { data: backups, error } = await this._client
      .from('backup')
      .select(`
        _id:id::text,
        created:inserted_at,
        uploadId:upload_id::text,
        url
      `)
      .match({ upload_id: uploadId })

    if (error) {
      throw new DBError(error)
    }

    return backups
  }

  /**
   * Upsert pin of a given cid.
   *
   * @param {string} cid
   * @param {import('./db-client-types').PinUpsertInput} pin
   * @return {Promise<number>}
   */
  async upsertPin (cid, pin) {
    /** @type {{ data: number, error: PostgrestError }} */
    const { data: pinId, error } = await this._client.rpc('upsert_pin', {
      data: {
        content_cid: cid,
        pin: {
          status: pin.status,
          location: {
            peer_id: pin.location.peerId,
            peer_name: pin.location.peerName,
            region: pin.location.region
          }
        }
      }
    }).single()

    if (error) {
      throw new DBError(error)
    }

    return pinId
  }

  /**
   * Upsert given pin status.
   *
   * @param {Array<import('./db-client-types').PinUpsertInput>} pins
   */
  async upsertPins (pins) {
    const { error } = await this._client
      .from('pin')
      .upsert(pins, { count: 'exact', returning: 'minimal' })

    if (error) {
      throw new DBError(error)
    }
  }

  /**
   * Get Pins for a cid
   *
   * @param {string} cid
   * @return {Promise<Array<import('./db-client-types').PinItemOutput>>}
   */
  async getPins (cid) {
    /** @type {{ data: Array<import('./db-client-types').PinItem>, error: PostgrestError }} */
    const { data: pins, error } = await this._client
      .from('pin')
      .select(`
        _id:id::text,
        status,
        created:inserted_at,
        updated:updated_at,
        location:pin_location(id::text, peerId:peer_id, peerName:peer_name, region)
      `)
      .match({ content_cid: cid })

    if (error) {
      throw new DBError(error)
    }

    return normalizePins(pins)
  }

  /**
   * Get All Pin requests.
   *
   * @param {Object} [options]
   * @param {number} [options.size = 600]
   * @return {Promise<Array<import('./db-client-types').PinRequestItemOutput>>}
   */
  async getPinRequests ({ size = 600 } = {}) {
    /** @type {{ data: Array<import('./db-client-types').PinRequestItemOutput>, error: PostgrestError }} */
    const { data: pinReqs, error } = await this._client
      .from('pin_request')
      .select(`
        _id:id::text,
        cid:content_cid,
        created:inserted_at
      `)
      .limit(size)

    if (error) {
      throw new DBError(error)
    }

    return pinReqs
  }

  /**
   * Delete pin requests with provided ids.
   *
   * @param {Array<number>} ids
   * @return {Promise<void>}
   */
  async deletePinRequests (ids) {
    /** @type {{ error: PostgrestError }} */
    const { error } = await this._client
      .from('pin_request')
      .delete()
      .in('id', ids)

    if (error) {
      throw new DBError(error)
    }
  }

  /**
   * Create pin sync requests.
   *
   * @param {Array<number>} pinSyncRequests
   */
  async createPinSyncRequests (pinSyncRequests) {
    /** @type {{ error: PostgrestError }} */
    const { error } = await this._client
      .from('pin_sync_request')
      .upsert(pinSyncRequests.map(psr => ({
        pin_id: psr,
        inserted_at: new Date().toISOString()
      })), {
        onConflict: 'pin_id'
      })

    if (error) {
      throw new DBError(error)
    }
  }

  /**
   * Get All Pin Sync requests.
   *
   * @param {Object} [options]
   * @param {string} [options.to]
   * @param {string} [options.after]
   * @param {number} [options.size]
   * @return {Promise<import('./db-client-types').PinSyncRequestOutput>}
   */
  async getPinSyncRequests ({ to, after, size }) {
    let query = this._client
      .from('pin_sync_request')
      .select(`
        _id:id::text,
        pin:pin(_id:id::text, status, contentCid:content_cid, created:inserted_at, location:pin_location(_id:id::text, peerId:peer_id, peerName:peer_name, region))
      `)
      .order(
        'inserted_at',
        { ascending: true }
      )
      .limit(size)

    if (to) {
      query = query.lt('inserted_at', to)
    }
    if (after) {
      query = query.gte('inserted_at', after)
    }

    /** @type {{ data: Array<import('./db-client-types').PinSyncRequestItem>, error: PostgrestError }} */
    const { data: pinSyncReqs, error } = await query
    if (error) {
      throw new DBError(error)
    }

    return {
      data: pinSyncReqs,
      after: !!size && pinSyncReqs.length === size && pinSyncReqs[0].pin.created // return after if more
    }
  }

  /**
   * Delete pin sync requests with provided ids.
   *
   * @param {Array<number>} ids
   * @return {Promise<void>}
   */
  async deletePinSyncRequests (ids) {
    /** @type {{ error: PostgrestError }} */
    const { error } = await this._client
      .from('pin_sync_request')
      .delete()
      .in('id', ids)

    if (error) {
      throw new DBError(error)
    }
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
    /** @type {{ data: Array<import('../db-client-types').Deal>, error: PostgrestError }} */
    const { data, error } = await this._client
      .rpc('find_deals_by_content_cids', {
        cids
      })

    if (error) {
      throw new DBError(error)
    }

    const result = {}
    for (const d of normalizeDeals(data)) {
      const cid = d.dataCid
      if (!Array.isArray(result[cid])) {
        result[cid] = [d]
      } else {
        result[cid].push(d)
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
    const now = new Date().toISOString()

    /** @type {{ data: string, error: PostgrestError }} */
    const { data, error } = await this._client.rpc('create_key', {
      data: {
        name,
        secret,
        user_id: user,
        inserted_at: now,
        updated_at: now
      }
    }).single()

    if (error) {
      throw new DBError(error)
    }

    return {
      _id: data
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
    /** @type {{ data, error: PostgrestError } */
    const { data, error } = await this._client
      .from('user')
      .select(`
        _id:id::text,
        issuer,
        keys:auth_key_user_id_fkey(_id:id::text, name,secret)
      `)
      .match({
        issuer
      })
      .filter('keys.deleted_at', 'is', null)
      .eq('keys.secret', secret)
      .single()

    if (error) {
      throw new DBError(error)
    }

    if (!data.keys.length) {
      throw new Error('user has no key with given secret')
    }

    return {
      _id: data.keys[0]._id,
      name: data.keys[0].name,
      user: {
        _id: data._id,
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
    /** @type {{ error: PostgrestError, data: Array<import('./db-client-types').AuthKeyItem> }} */
    const { data, error } = await this._client.rpc('user_keys_list', { query_user_id: userId })

    if (error) {
      throw new DBError(error)
    }

    return data.map(ki => ({
      _id: ki.id,
      name: ki.name,
      secret: ki.secret,
      created: ki.created,
      hasUploads: Boolean(ki.uploads)
    }))
  }

  /**
   * Delete auth key with given id.
   *
   * @param {number} userId
   * @param {number} keyId
   */
  async deleteKey (userId, keyId) {
    /** @type {{ data, error: PostgrestError }} */
    const { data, error } = await this._client
      .from('auth_key')
      .update({
        deleted_at: new Date().toISOString()
      })
      .match({
        id: keyId,
        user_id: userId
      })
      .is('deleted_at', null)

    if (error) {
      throw new DBError(error)
    }

    return {
      _id: data.id
    }
  }

  /**
   * Get metrics for a given key.
   *
   * @param {string} key
   */
  async getMetricsValue (key) {
    let res
    switch (key) {
      case 'users_total':
        res = await getUserMetrics(this._client)
        return res.total
      case 'uploads_total':
        res = await getUploadMetrics(this._client)
        return res.total
      case 'content_bytes_total':
        res = await getContentMetrics(this._client)
        return res.totalBytes
      case 'pins_total':
        res = await getPinMetrics(this._client)
        return res.total
      case 'pins_bytes_total':
        res = await getPinBytesMetrics(this._client)
        return res.totalBytes
      case 'pins_status_queued_total':
      case 'pins_status_pinning_total':
      case 'pins_status_pinned_total':
      case 'pins_status_failed_total':
        res = await getPinStatusMetrics(this._client, key)
        return res.total
      default:
        throw new Error('unknown metric requested')
    }
  }

  /**
   * Get the raw IPNS record for a given key.
   *
   * @param {string} key
   */
  async resolveNameRecord (key) {
    /** @type {{ error: Error, data: Array<import('../db-client-types').NameItem> }} */
    const { data, error } = await this._client
      .from('name')
      .select('record')
      .match({ key })

    if (error) {
      throw new DBError(error)
    }

    return data.length ? data[0].record : undefined
  }

  /**
   * Publish a new IPNS record, ensuring the sequence number is greater than
   * the sequence number of an existing record for the given key.
   *
   * @param {string} key
   * @param {string} record Base 64 encoded serialized IPNS record.
   * @param {boolean} hasV2Sig If the record has a v2 signature.
   * @param {bigint} seqno Sequence number from the record.
   * @param {bigint} validity Validity from the record in nanoseconds since 00:00, Jan 1 1970 UTC.
   */
  async publishNameRecord (key, record, hasV2Sig, seqno, validity) {
    const { error } = await this._client.rpc('publish_name_record', {
      data: {
        key,
        record,
        has_v2_sig: hasV2Sig,
        seqno: seqno.toString(),
        validity: validity.toString()
      }
    })

    if (error) {
      throw new DBError(error)
    }
  }
}
