import { GraphQLClient, gql } from 'graphql-request'
import retry from 'p-retry'

export class FaunaClient {
  constructor ({ endpoint, token }) {
    this._client = new GraphQLClient(endpoint, {
      fetch: globalThis.fetch,
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  /**
   * Upsert user.
   *
   * @param {import('../db-client-types').UpsertUserInput} user
   * @return {import('../db-client-types').UpsertUserOutput}
   */
  async upsertUser (user) {
    const res = await this.query(gql`
      mutation CreateOrUpdateUser($data: CreateOrUpdateUserInput!) {
        createOrUpdateUser(data: $data) {
          issuer
        }
      }
    `, { data: user })

    return res.createOrUpdateUser
  }

  /**
   * Get user by its issuer.
   *
   * @param {string} issuer
   * @return {Promise<import('../db-client-types').UserOutput>}
   */
  async getUser (issuer) {
    const res = await this.query(gql`
      query FindUserByIssuer ($issuer: String!) {
        findUserByIssuer(issuer: $issuer) {
          _id
          issuer
          email
          github
        }
      }
    `, { issuer })
    return res.findUserByIssuer
  }

  /**
   * Get used storage in bytes.
   *
   * @param {number} userId
   * @returns {Promise<number>}
   */
  async getUsedStorage (userId) {
    const res = await this.query(gql`
      query findUserByID($id: ID!) {
        findUserByID(id: $id) {
          usedStorage
        }
      }
    `, { id: userId })

    return res.findUserByID.usedStorage
  }

  /**
   * Create upload with content and pins.
   *
   * @param {import('../db-client-types').CreateUploadInput} data
   * @returns {Promise<import('../db-client-types').CreateUploadOutput>}
   */
  async createUpload (data) {
    const res = await this.query(gql`
      mutation CreateUpload($data: CreateUploadInput!) {
        createUpload(data: $data) {
          content {
            _id
            dagSize
          }
        }
      }
    `, {
      data: {
        user: data.user,
        authToken: data.authKey,
        cid: data.contentCid,
        name: data.name,
        type: data.type,
        backupUrls: data.backupUrls,
        pins: data.pins,
        dagSize: data.dagSize
      } // uniform data with fauna data model
    })

    return res
  }

  /**
   * Get upload with user, auth_keys, content and pins.
   *
   * @param {string} cid
   * @param {number} userId
   * @returns {Promise<import('../db-client-types').UploadItemOutput>}
   */
  async getUpload (cid, userId) {
    throw new Error('not implemented in fauna')
  }

  /**
   * List uploads of a given user.
   *
   * @param {number} userId
   * @param {import('../db-client-types').ListUploadsOptions} [opts]
   * @returns {Promise<Array<import('../db-client-types').UploadItemOutput>>}
   */
  async listUploads (userId, opts = {}) {
    const res = await this.query(gql`
    query FindUploadsByUser($where: FindUploadsByUserInput!, $sortBy: UploadListSortBy, $sortOrder: SortDirection, $size: Int!) {
      findUploadsByUser(where: $where, sortBy: $sortBy, sortOrder: $sortOrder, _size: $size) {
        data {
          name
          content {
            cid
            dagSize
            aggregateEntries {
              data {
                aggregate {
                  deals {
                    data {
                      storageProvider
                      renewal
                      dealId
                      status
                    }
                  }
                }
              }
            }
            pins {
              data {
                status
              }
            }
          }
          created
        }
      }
    }
  `, {
      where: { createdBefore: opts.before, user: userId },
      size: opts.size,
      sortBy: opts.sortBy,
      sortOrder: opts.sortOrder
    })

    const { data: raw } = res.findUploadsByUser

    return raw.map(({ name, content, created }) => ({
      name,
      ...convertRawContent(content),
      created
    }))
  }

  /**
   * Rename an upload.
   *
   * @param {number} user
   * @param {string} cid
   * @param {string} name
   */
  async renameUpload (user, cid, name) {
    const res = await this.query(gql`
    mutation RenameUserUpload($user: ID!, $cid: String!, $name: String!) {
      renameUserUpload(user: $user, cid: $cid, name: $name) {
        name
      }
    }
  `, { cid, user, name })

    return res.renameUserUpload
  }

  /**
   * Delete a user upload.
   *
   * @param {number} userId
   * @param {string} cid
   */
  async deleteUpload (userId, cid) {
    const res = await this.query(gql`
      mutation DeleteUserUpload($user: ID!, $cid: String!) {
        deleteUserUpload(user: $user, cid: $cid) {
          _id
        }
      }
    `, { cid, user: userId })

    return res.deleteUserUpload
  }

  /**
   * Get content status of a given cid.
   *
   * @param {string} cid
   * @returns {Promise<import('../db-client-types').ContentItemOutput>}
   */
  async getStatus (cid) {
    const result = await this.query(
      gql`query FindContentByCid($cid: String!) {
      findContentByCid(cid: $cid) {
        cid
        created
        dagSize
        aggregateEntries {
          data {
            dataModelSelector
            aggregate {
              dataCid
              pieceCid
              deals {
                data {
                  storageProvider
                  dealId
                  status
                  activation
                  created
                  updated
                }
              }
            }
          }
        }
        pins {
          data {
            status
            updated
            location {
              peerId
              peerName
              region
            }
          }
        }
      }
    }
  `, { cid })

    const { findContentByCid: raw } = result

    return raw && convertRawContent(raw)
  }

  /**
   * Get backups for a given upload.
   *
   * @param {number} uploadId
   * @return {Promise<Array<import('../db-client-types').BackupOutput>>}
   */
  async getBackups (uploadId) {
    throw new Error('not implemented in fauna')
  }

  /**
   * Upsert pin.
   *
   * @param {string} cid
   * @param {import('../db-client-types').PinUpsertInput} pin
   * @return {Promise<number>}
   */
  async upsertPin (cid, pin) {
    const res = await this.query(gql`
      mutation CreateOrUpdatePin($data: CreateOrUpdatePinInput!) {
        createOrUpdatePin(data: $data) {
          _id
        }
      }
    `, { data: { content: cid, ...pin } })

    return res
  }

  /**
   * Upsert given pin status.
   *
   * @param {Array<import('../db-client-types').PinIdAndStatus>} pins
   */
  async upsertPins (pins) {
    await this.query(gql`
      mutation UpdatePins($pins: [UpdatePinInput!]!) {
        updatePins(pins: $pins) {
          _id
        }
      }
    `, { pins: pins.map(p => ({ pin: p.id, status: p.status })) })
  }

  /**
   * Get Pins for a cid
   *
   * @param {string} cid
   * @return {Promise<Array<import('../db-client-types').PinItemOutput>>}
   */
  async getPins (cid) {
    throw new Error('not implemented in fauna')
  }

  /**
   * Get All Pin requests.
   *
   * @param {Object} [options]
   * @param {number} [options.size = 600]
   * @return {Promise<Array<import('../db-client-types').PinRequestItemOutput>>}
   */
  async getPinRequests ({ size = 600 } = {}) {
    const res = await this.query(gql`
      query FindAllPinRequests($size: Int!) {
        findAllPinRequests(_size: $size) {
          data {
            _id
            cid
            created
          }
        }
      }
    `, { size })

    return res.findAllPinRequests.data
  }

  /**
   * Delete pin requests with provided ids.
   *
   * @param {Array<number>} ids
   * @return {Promise<void>}
   */
  async deletePinRequests (ids) {
    await this.query(gql`
      mutation DeletePinRequests($requests: [ID!]!) {
        deletePinRequests(requests: $requests){
          _id
        }
      }
    `, { requests: ids })
  }

  /**
   * Create pin sync requests.
   *
   * @param {Array<number>} pinSyncRequests
   */
  async createPinSyncRequests (pinSyncRequests) {
    await this.query(gql`
      mutation CreatePinSyncRequests($pins: [ID!]!) {
        createPinSyncRequests(pins: $pins) {
          _id
        }
      }
    `, { pins: pinSyncRequests })
  }

  /**
   * Get All Pin Sync requests.
   *
   * @param {Object} [options]
   * @param {string} [options.to]
   * @param {string} [options.afer]
   * @return {Promise<Array<import('../db-client-types').PinSyncRequestOutput>>}
   */
  async getPinSyncRequests ({ to, after } = {}) {
    const res = await this.query(gql`
      query FindPinSyncRequests($to: Time, $after: String) {
        findPinSyncRequests(to: $to, _size: 1000, _cursor: $after) {
          data {
            _id
            pin {
              _id
              content {
                _id
                cid
                dagSize
              }
              location {
                peerId
              }
              status
              created
            }
          }
          after
        }
      }
    `, { to, after })

    return {
      data: res.findPinSyncRequests.data.map(req => ({
        _id: req._id,
        pin: {
          _id: req.pin._id,
          status: req.pin.status,
          created: req.pin.created,
          contentCid: req.pin.content.cid,
          location: {
            peerId: req.pin.location.peerId
          }
        }
      })),
      after: res.findPinSyncRequests.after
    }
  }

  /**
   * Delete pin sync requests with provided ids.
   *
   * @param {Array<number>} ids
   * @return {Promise<void>}
   */
  async deletePinSyncRequests (ids) {
    await this.query(gql`
      mutation DeletePinSyncRequests($requests: [ID!]!) {
        deletePinSyncRequests(requests: $requests) {
          _id
        }
      }
    `, { requests: ids })
  }

  /**
   * Get deals for a cid
   *
   * @param {string} cid
   * @return {Promise<import('../db-client-types').Deal[]>}
   */
  async getDeals (cid) {
    throw new Error('not implemented in fauna')
  }

  /**
   * Get deals for multiple cids
   *
   * @param {string[]} cids
   * @return {Promise<Record<string, import('../db-client-types').Deal[]>>}
   */
  async getDealsForCids (cids = []) {
    throw new Error('not implemented in fauna')
  }

  /**
   * Create a new auth key.
   *
   * @param {import('../db-client-types').CreateAuthKeyInput} key
   * @return {Promise<import('../db-client-types').CreateAuthKeyOutput>}
   */
  async createKey ({ name, secret, user }) {
    const res = await this.query(gql`
      mutation CreateAuthToken($data: CreateAuthTokenInput!) {
        createAuthToken(data: $data) {
          _id
        }
      }
    `, { data: { user, name, secret } })

    return res.createAuthToken
  }

  /**
   * Get key with issuer and secret.
   *
   * @param {string} issuer
   * @param {string} secret
   * @return {Promise<import('../db-client-types').AuthKey>}
   */
  async getKey (issuer, secret) {
    const res = await this.query(gql`
    query VerifyAuthToken ($issuer: String!, $secret: String!) {
      verifyAuthToken(issuer: $issuer, secret: $secret) {
        _id
        name
        user {
          _id
          issuer
        }
      }
    }
  `, { issuer, secret })
    return res.verifyAuthToken
  }

  /**
   * List auth keys of a given user.
   *
   * @param {number} userId
   * @return {Promise<Array<import('../db-client-types').AuthKeyItemOutput>>}
   */
  async listKeys (userId) {
    const res = await this.query(gql`
    query FindAuthTokensByUser($user: ID!) {
      # Paginated but users are probably not going to have tons of these.
      # Note: 100,000 is the max page size.
      findAuthTokensByUser(user: $user, _size: 100000) {
        data {
          _id
          name
          secret
          created
          uploads(_size: 1) {
            data {
              _id
            }
          }
        }
      }
    }
  `, { user: userId })

    res.findAuthTokensByUser.data = res.findAuthTokensByUser.data.map(t => {
      t.hasUploads = Boolean(t.uploads.data.length)
      delete t.uploads
      return t
    })

    return res.findAuthTokensByUser.data
  }

  /**
   * Delete auth key with given id.
   *
   * @param {number} userId
   * @param {number} keyId
   */
  async deleteKey (userId, keyId) {
    const res = await this.query(gql`
    mutation DeleteAuthToken($user: ID!, $authToken: ID!) {
      deleteAuthToken(user: $user, authToken: $authToken) {
        _id
      }
    }
  `, { user: userId, authToken: keyId })

    return res.deleteAuthToken
  }

  /**
   * Get metrics for a given key.
   *
   * @param {string} key
   */
  async getMetricsValue (key) {
    const { findMetricByKey } = await retry(() => this.query(gql`
    query FindMetric($key: String!) {
    findMetricByKey(key: $key) {
      key
      value
      updated
    }
  }
  `, { key }))

    return findMetricByKey ? findMetricByKey.value : 0
  }

  /**
   * @template T
   * @template V
   * @param {import('graphql-request').RequestDocument} document
   * @param {V} variables
   * @returns {Promise<T>}
   */
  query (document, variables) {
    return this._client.request(document, variables)
  }
}

const DEAL_STATUS = new Set([
  'Queued',
  'Published',
  'Active'
])

const PIN_STATUS = new Set([
  'Pinned',
  'Pinning',
  'PinQueued'
])

function convertRawContent (raw) {
  const pins = raw.pins.data
    .filter(({ status }) => PIN_STATUS.has(status))
    .map(({ status, updated, location }) => ({ status, updated, ...location }))

  const deals = raw.aggregateEntries.data.map(({ dataModelSelector, aggregate }) => {
    const { pieceCid, dataCid, deals } = aggregate
    if (deals.data.length === 0) {
      return [{
        status: 'Queued',
        pieceCid,
        dataCid,
        dataModelSelector
      }]
    }
    return deals.data
      .filter(({ status }) => DEAL_STATUS.has(status))
      .map(({ dealId, storageProvider, status, activation, created, updated }) => ({
        dealId,
        storageProvider,
        status,
        pieceCid,
        dataCid,
        dataModelSelector,
        activation,
        created,
        updated
      }))
  }).reduce((a, b) => a.concat(b), []) // flatten array of arrays.

  const { cid, dagSize, created } = raw

  return {
    cid,
    created,
    dagSize,
    pins,
    deals
  }
}
