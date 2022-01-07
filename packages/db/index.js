import { PostgrestClient } from '@supabase/postgrest-js'

import {
  normalizeUpload, normalizeContent, normalizePins, normalizeDeals, normalizePaPinRequest,
  PIN_STATUS,
  PIN_STATUS_FILTER
} from './utils.js'
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

const PAPinRequestTableName = 'pa_pin_request'
const pinRequestSelect = `
  _id:id::text,
  requestedCid:requested_cid,
  contentCid:content_cid,
  authKey:auth_key_id,
  name,
  deleted:deleted_at,
  created:inserted_at,
  updated:updated_at,
  content(cid, dagSize:dag_size, pins:pin(status, updated:updated_at, location:pin_location(_id:id, peerId:peer_id, peerName:peer_name, region)))`

const listPinsQuery = `
  _id:id::text,
  requestedCid:requested_cid,
  contentCid:content_cid,
  authKey:auth_key_id,
  name,
  deleted:deleted_at,
  created:inserted_at,
  updated:updated_at,
  content!inner(
    cid,
    dagSize:dag_size,
    pins:pin!inner(
      status,
      updated:updated_at,
      location:pin_location(
        _id:id,
        peerId:peer_id,
        peerName:peer_name,
        region
      )
    )
  )`

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
   * @return {Promise<import('./db-client-types').UserOutput | undefined>}
   */
  async getUser (issuer) {
    /** @type {{ data: import('./db-client-types').UserOutput[], error: PostgrestError }} */
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

    if (error) {
      throw new DBError(error)
    }

    return data.length ? data[0] : undefined
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
    const now = new Date().toISOString()
    /** @type {{ data: import('./db-client-types').UploadItem, error: PostgrestError }} */
    const { data, error } = await this._client
      .from('upload')
      .update({
        deleted_at: now,
        updated_at: now
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
    /** @type {{ data: Array<import('./db-client-types').ContentItem>, error: PostgrestError }} */
    const { data, error } = await this._client
      .from('content')
      .select(`
        cid,
        dagSize:dag_size,
        created:inserted_at,
        pins:pin(status, updated:updated_at, location:pin_location(peerId:peer_id, peerName:peer_name, region))
      `)
      .match({ cid })

    if (error) {
      throw new DBError(error)
    }

    if (!data || !data.length) {
      return undefined
    }

    const deals = await this.getDeals(cid)
    return {
      ...normalizeContent(data[0]),
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
   * Get deals for multiple cids. This function is error tolerant as it uses
   * the dagcargo FDW. It will return an empty object if any error is
   * encountered fetching the data.
   *
   * @param {string[]} cids
   * @return {Promise<Record<string, import('./db-client-types').Deal[]>>}
   */
  async getDealsForCids (cids = []) {
    /** @type {{ data: Array<import('./db-client-types').Deal>, error: PostgrestError }} */
    const { data, error } = await this._client
      .rpc('find_deals_by_content_cids', {
        cids
      })

    if (error) {
      return {}
    }

    const result = {}
    for (const d of normalizeDeals(data)) {
      const cid = d.contentCid
      delete d.contentCid
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
   * @return {Promise<import('./db-client-types').AuthKey | undefined>}
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

    if (error) {
      throw new DBError(error)
    }

    if (!data.length) {
      return undefined
    }

    const keyData = data[0]
    if (!keyData.keys.length) {
      return undefined
    }

    return {
      _id: keyData.keys[0]._id,
      name: keyData.keys[0].name,
      user: {
        _id: keyData._id,
        issuer: keyData.issuer
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
    const now = new Date().toISOString()
    /** @type {{ data, error: PostgrestError }} */
    const { data, error } = await this._client
      .from('auth_key')
      .update({
        deleted_at: now,
        updated_at: now
      })
      .match({
        id: keyId,
        user_id: userId
      })
      .is('deleted_at', null)

    if (error) {
      throw new DBError(error)
    }

    if (!data.length) {
      return undefined
    }

    return {
      _id: data[0].id
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
   * Creates a Pin Request.
   *
   * @param {import('./db-client-types').PAPinRequestUpsertInput} pinRequest
   * @return {Promise<import('./db-client-types').PAPinRequestUpsertOutput>}
   */
  async createPAPinRequest (pinRequest) {
    /** @type { import('./db-client-types').PAPinRequestUpsertOutput } */

    // TODO is there a better way to avoid 2 queries?
    // ie. before insert trigger https://dba.stackexchange.com/questions/27178/handling-error-of-foreign-key
    /** @type {{data: {cid: string}}} */
    const { data: content } = await this._client
      .from('content')
      .select('cid')
      .eq('cid', pinRequest.cid)
      .single()

    const toInsert = {
      requested_cid: pinRequest.requestedCid,
      auth_key_id: pinRequest.authKey,
      name: pinRequest.name
    }

    // If content already exists updated foreigh key
    if (content?.cid) {
      toInsert.content_cid = content.cid
    }

    /** @type {{data: import('./db-client-types').PAPinRequestItem, error: PostgrestError }} */
    const { data, error } = await this._client
      .from(PAPinRequestTableName)
      .insert(toInsert)
      .select(pinRequestSelect)
      .single()

    if (error) {
      throw new DBError(error)
    }

    return normalizePaPinRequest(data)
  }

  /**
   * Get a Pin Request by id
   *
   * @param {number} pinRequestId
   * @return {Promise<import('./db-client-types').PAPinRequestUpsertOutput>}
   */
  async getPAPinRequest (pinRequestId) {
    /** @type {{data: import('./db-client-types').PAPinRequestItem, error: PostgrestError }} */
    const { data, error } = await this._client
      .from(PAPinRequestTableName)
      .select(pinRequestSelect)
      .eq('id', pinRequestId)
      .is('deleted_at', null)
      .single()

    if (error) {
      throw new DBError(error)
    }

    return normalizePaPinRequest(data)
  }

  /**
   * Creates some content and relative pins, pin_sync_request and pin_requests
   *
   * Once the content is created through this function, cron jobs will run to check the
   * pin status and update them in our db.
   * At the same time a pin_request is created to duplicate the content on Pinata
   *
   * @param {import('./db-client-types').ContentInput} content
   * @param {object} [opt]
   * @param {boolean} [opt.updatePinRequests] If provided
   * @return {Promise<string>} The content cid
   */
  async createContent (content, {
    updatePinRequests = false
  } = {}) {
    const now = new Date().toISOString()

    /** @type {{data: string, error: PostgrestError }} */
    const { data: cid, error: createError } = await this._client
      .rpc('create_content', {
        data: {
          content_cid: content.cid,
          dag_size: content.dagSize,
          inserted_at: now,
          updated_at: now,
          pins: content.pins.map(pin => ({
            status: pin.status,
            location: {
              peer_id: pin.location.peerId,
              peer_name: pin.location.peerName,
              region: pin.location.region
            }
          }))
        }
      }).single()

    if (createError) {
      throw new DBError(createError)
    }

    // Update Pin Request FK
    if (updatePinRequests) {
      /** @type {{data: string, error: PostgrestError }} */
      const { error: updateError } = (await this._client
        .from(PAPinRequestTableName)
        .update({ content_cid: content.cid })
        .match({
          requested_cid: content.cid
        }))

      if (updateError) {
        throw new DBError(updateError)
      }
    }

    return cid
  }

  /**
   * Get a filtered list of pin requests for a user
   *
   * @param {string} authKey
   * @param {import('./db-client-types').ListPAPinRequestOptions} opts
   * @return {Promise<import('./db-client-types').ListPAPinRequestResults> }> }
   */
  async listPAPinRequests (authKey, opts = {}) {
    const match = opts?.match || 'exact'
    const limit = opts?.limit || 10

    let query = this._client
      .from(PAPinRequestTableName)
      .select(listPinsQuery)
      .eq('auth_key_id', authKey)
      .order('inserted_at', { ascending: false })

    if (!Object.keys(opts).length) {
      query = query.eq('content.pins.status', PIN_STATUS[PIN_STATUS.Pinned])
    } else {
      if (opts.status) {
        const status = []
        if (opts.status.includes(PIN_STATUS_FILTER[PIN_STATUS_FILTER.queued])) {
          status.push(PIN_STATUS[PIN_STATUS.PinQueued])
        }
        if (opts.status.includes(PIN_STATUS_FILTER[PIN_STATUS_FILTER.pinning])) {
          status.push(PIN_STATUS[PIN_STATUS.Pinning])
        }
        if (opts.status.includes(PIN_STATUS_FILTER[PIN_STATUS_FILTER.pinned])) {
          status.push(PIN_STATUS[PIN_STATUS.Pinned])
        }
        if (opts.status.includes(PIN_STATUS_FILTER[PIN_STATUS_FILTER.failed])) {
          status.push(PIN_STATUS[PIN_STATUS.PinError])
        }
        query = query.in('content.pins.status', status)
      }

      if (opts.cid) {
        query = query.in('requested_cid', opts.cid)
      }

      if (opts.name) {
        switch (match) {
          case 'exact':
            query = query.like('name', `${opts.name}`)
            break
          case 'iexact':
            query = query.ilike('name', `${opts.name}`)
            break
          case 'partial':
            query = query.like('name', `%${opts.name}%`)
            break
          case 'ipartial':
            query = query.ilike('name', `%${opts.name}%`)
            break
        }
      }

      if (opts.before) {
        query = query.lte('inserted_at', opts.before)
      }

      if (opts.after) {
        query = query.gte('inserted_at', opts.after)
      }
    }

    // TODO(https://github.com/web3-storage/web3.storage/issues/798): filter by meta is missing

    /** @type {{ data: Array<import('./db-client-types').PAPinRequestItem>, error: Error }} */
    const { data, error } = (await query)

    if (error) {
      throw new DBError(error)
    }

    const count = data.length

    // TODO(https://github.com/web3-storage/web3.storage/issues/804): Not limiting the query might cause
    // performance issues if a user created lots of requests with a token. We should improve this.
    const pinRequests = data.slice(0, limit)
    const pins = pinRequests.map(pinRequest => normalizePaPinRequest(pinRequest))

    return {
      count,
      results: pins
    }
  }

  /**
   * Delete a user PA pin request.
   *
   * @param {number} requestId
   * @param {string} authKey
   */
  async deletePAPinRequest (requestId, authKey) {
    const date = new Date().toISOString()
    /** @type {{ data: import('./db-client-types').PAPinRequestItem, error: PostgrestError }} */
    const { data, error } = await this._client
      .from(PAPinRequestTableName)
      .update({
        deleted_at: date,
        updated_at: date
      })
      .match({ auth_key_id: authKey, id: requestId })
      .filter('deleted_at', 'is', null)
      .single()

    if (error) {
      throw new DBError(error)
    }

    return {
      _id: data.id
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
