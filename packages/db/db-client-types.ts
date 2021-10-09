import { definitions } from './postgres/db-types'

// User
export type UpsertUserInput = {
  id: definitions['user']['id'],
  name: definitions['user']['name'],
  picture?: definitions['user']['picture'],
  email: definitions['user']['email'],
  issuer: definitions['user']['issuer'],
  github?: definitions['user']['github'],
  publicAddress: definitions['user']['public_address']
}

export type UpsertUserOutput = {
  issuer: string
}

export type User = definitions['user']

export type UserOutput = {
  _id: definitions['user']['id'],
  name: definitions['user']['name'],
  email: definitions['user']['email'],
  issuer: definitions['user']['issuer'],
  publicAddress: definitions['user']['public_address']
  created: definitions['user']['inserted_at'],
  updated: definitions['user']['updated_at']
}

// Auth key
export interface CreateAuthKeyInput {
  name: definitions['auth_key']['name']
  secret: definitions['auth_key']['secret']
  user: definitions['auth_key']['user_id']
}

export type CreateAuthKeyOutput = {
  _id: definitions['auth_key']['id']
}

export type AuthKey = {
  _id: definitions['auth_key']['id'],
  name: definitions['auth_key']['name'],
  user: {
    _id: definitions['user']['id'],
    issuer: definitions['user']['issuer']
  }
}

export type AuthKeyItem = definitions['auth_key'] & {
  uploads: Array<
    Pick<definitions['upload'], 'id'>
  >
}

export type AuthKeyItemOutput = {
  _id: definitions['auth_key']['id']
  name: definitions['auth_key']['name']
  secret: definitions['auth_key']['secret']
  created: definitions['auth_key']['inserted_at']
  hasUploads: boolean
}

// Pin
export type PinItem = definitions['pin'] & {
  pin_location: definitions['pin_location']
}

export type PinItemOutput = {
  _id?: definitions['pin']['id']
  status: definitions['pin']['status']
  created?: definitions['pin']['inserted_at']
  updated: definitions['pin']['updated_at']
  peerId: definitions['pin_location']['peer_id']
  peerName: definitions['pin_location']['peer_name']
  region: definitions['pin_location']['region']
}

// Backup
export type BackupOutput = {
  _id: definitions['backup']['id']
  created: definitions['backup']['inserted_at']
  url: definitions['backup']['url']
  uploadId: definitions['backup']['upload_id']
}

// Deal
export type Deal = {
  dealId: definitions['deal']['deal_id']
  storageProvider: definitions['deal']['provider']
  status: definitions['deal']['status']
  pieceCid: definitions['aggregate']['piece_cid']
  dataCid: definitions['aggregate_entry']['cid_v1']
  dataModelSelector: definitions['aggregate_entry']['datamodel_selector']
  dealActivation: definitions['deal']['start_time']
  dealExpiration: definitions['deal']['end_time']
  created: definitions['deal']['entry_created']
  updated: definitions['deal']['entry_last_updated']
}

// Content
export type ContentItem = {
  cid: definitions['content']['cid']
  dag_size: definitions['content']['dag_size']
  inserted_at?: definitions['upload']['inserted_at']
  pins: Array<{
    status: definitions['pin']['status']
    updated_at: definitions['pin']['updated_at']
    pin_location: {
      _id: definitions['pin_location']['id']
      peer_id: definitions['pin_location']['peer_id']
      peer_name: definitions['pin_location']['peer_name']
      region: definitions['pin_location']['region']
    }
  }>
}

export type ContentItemOutput = {
  created: definitions['content']['inserted_at']
  cid: definitions['content']['cid']
  dagSize?: definitions['content']['dag_size']
  pins: Array<PinItemOutput>,
  deals: Array<Deal>
}


// Upload
export interface CreateUploadInput {
  user: definitions['upload']['user_id']
  authKey: definitions['upload']['auth_key_id']
  contentCid: definitions['upload']['content_cid']
  sourceCid: definitions['upload']['source_cid']
  type: definitions['upload']['type']
  name?: definitions['upload']['name']
  dagSize?: definitions['content']['dag_size']
  created?: definitions['upload']['inserted_at']
  updated?: definitions['upload']['updated_at']
  pins: Array<{
    status: definitions['pin']['status']
    location: {
      peerId: definitions['pin_location']['peer_id']
      peerName: definitions['pin_location']['peer_name']
      region: definitions['pin_location']['region']
    }
  }>,
  backupUrls: Array<definitions['backup']['url']>
}

export type CreateUploadOutput = {
  _id: definitions['upload']['id'],
  cid: definitions['content']['cid']
}

export type UploadItem = {
  id: definitions['upload']['id']
  type: definitions['upload']['type']
  name?: definitions['upload']['name']
  inserted_at?: definitions['upload']['inserted_at']
  updated_at?: definitions['upload']['updated_at']
  content: {
    cid: definitions['content']['cid']
    dag_size: definitions['content']['dag_size']
    pins: Array<{
      status: definitions['pin']['status']
      updated_at: definitions['pin']['updated_at']
      pin_location: {
        id: definitions['pin_location']['id']
        peer_id: definitions['pin_location']['peer_id']
        peer_name: definitions['pin_location']['peer_name']
        region: definitions['pin_location']['region']
      }
    }>
  }
}

export type UploadItemOutput = {
  _id: definitions['upload']['id']
  type: definitions['upload']['type']
  name?: definitions['upload']['name']
  created: definitions['upload']['inserted_at']
  updated: definitions['upload']['updated_at']
  cid: definitions['content']['cid']
  dagSize?: definitions['content']['dag_size']
  pins: Array<PinItemOutput>,
  deals: Array<Deal>
}

export type UploadOutput = definitions['upload'] & {
  user: Pick<definitions['user'], 'id' | 'issuer'>
  key: Pick<definitions['auth_key'], 'name'>
  content: Pick<definitions['content'], 'dag_size'> & {
    pin: Pick<definitions['pin'], 'id'> & {
      location: Pick<definitions['pin_location'], 'peer_id' | 'peer_name' | 'region'>
    }[]
  },
  deals: Deal[]
}

export type ListUploadsOptions = {
  /**
   * Uploads created before a given timestamp.
   */
  before?: string
  /**
   * Uploads created after a given timestamp.
   */
  after?: string
  /**
   * Max records (default: 10).
   */
  size?: number
  /**
   * Sort by given property.
   */
  sortBy?: 'Date' | 'Name'
  /**
   * Sort order.
   */
  sortOrder?: 'Asc' | 'Desc'
}
