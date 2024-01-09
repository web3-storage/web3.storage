// @ts-nocheck
import { definitions } from './postgres/pg-rest-api-types'

// User
export type UpsertUserInput = {
  id?: definitions['user']['id'],
  name: definitions['user']['name'],
  picture?: definitions['user']['picture'],
  email: definitions['user']['email'],
  issuer: definitions['user']['issuer'],
  github?: definitions['user']['github'],
  publicAddress: definitions['user']['public_address']
}

export type UpsertUserOutput = {
  id: string
  // whether the upsert inserted a new record (if falsy, it was updated)
  inserted: boolean
  issuer: string
}

export type GetUserOptions = {
  includeTags?: boolean
}

export type User = definitions['user']

export type UserOutput = {
  _id: string,
  name: definitions['user']['name'],
  email: definitions['user']['email'],
  issuer: definitions['user']['issuer'],
  github?: definitions['user']['github'],
  publicAddress: definitions['user']['public_address'],
  created: definitions['user']['inserted_at'],
  updated: definitions['user']['updated_at'],
  tags?: Array<UserTagInfo>
}

export type UserTagInfo = {
  tag: definitions['user_tag']['tag']
  value: definitions['user_tag']['value']
  deleted_at?: definitions['user_tag']['deleted_at']
}

export type UserTagInput = {
  tag: definitions['user_tag']['tag']
  value: definitions['user_tag']['value']
  reason?: definitions['user_tag']['reason']
}

// Auth key
export interface CreateAuthKeyInput {
  name: definitions['auth_key']['name']
  secret: definitions['auth_key']['secret']
  user: definitions['auth_key']['user_id']
}

export type CreateAuthKeyOutput = {
  _id: string
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
  has_uploads: boolean
}

export type AuthKeyItemOutput = {
  _id: string
  name: definitions['auth_key']['name']
  secret: definitions['auth_key']['secret']
  created: definitions['auth_key']['inserted_at']
  hasUploads: boolean
}

// Pin
export type PinUpsertInput = {
  _id?: string,
  status: definitions['pin']['status'],
  location: Location,
}

export type PinItem = PinUpsertInput & {
  _id: string,
  created: definitions['pin']['inserted_at']
  updated: definitions['pin']['updated_at']
}

export type PinsUpsertInput = {
  id?: string
  status: definitions['pin']['status']
  contentCid: definitions['pin']['content_cid']
  location: Location
}

export type PinItemOutput = {
  _id?: string
  status: definitions['pin']['status']
  created?: definitions['pin']['inserted_at']
  updated: definitions['pin']['updated_at']
  peerId: definitions['pin_location']['peer_id']
  peerName: definitions['pin_location']['peer_name']
  region: definitions['pin_location']['region']
}

export type PinSyncRequestItem = {
  _id: string
  pin: {
    _id: string
    status: definitions['pin']['status']
    contentCid: definitions['pin']['content_cid']
    created: definitions['pin']['inserted_at']
    location: Location
  }
}

export type PinSyncRequestOutput = {
  data: Array<PinSyncRequestItem>
  after: definitions['pin']['inserted_at']
}

// Backup
export type BackupOutput = definitions['upload']['backup_urls']

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
export type ContentInput = {
  cid: definitions['content']['cid']
  dagSize: definitions['content']['dag_size']
  pins: Array<{
    status: definitions['pin']['status']
    updated: definitions['pin']['updated_at']
    location: Location
  }>
}

export type ContentItem = {
  cid: definitions['content']['cid']
  dagSize: definitions['content']['dag_size']
  created?: definitions['upload']['inserted_at']
  pins: Array<{
    status: definitions['pin']['status']
    updated: definitions['pin']['updated_at']
    location: Location
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
    location: Location
  }>,
  backupUrls: definitions['upload']['backup_urls']
}

export type CreateUploadOutput = {
  _id: string
  cid: definitions['content']['cid']
}

export type UploadItem = {
  id: string
  sourceCid: definitions['upload']['source_cid']
  type: definitions['upload']['type']
  name?: definitions['upload']['name']
  created?: definitions['upload']['inserted_at']
  updated?: definitions['upload']['updated_at']
  content: ContentItem
  backupUrls: definitions['upload']['backup_urls']
}

export type UploadItemOutput = {
  _id: string
  type: definitions['upload']['type']
  name?: definitions['upload']['name']
  created: definitions['upload']['inserted_at']
  updated: definitions['upload']['updated_at']
  cid: definitions['content']['cid']
  dagSize?: definitions['content']['dag_size']
  pins: Array<PinItemOutput>,
  deals: Array<Deal>
  /**
   * the graph from `cid` can be recreated from the blocks in these parts
   * @see https://github.com/web3-storage/content-claims#partition-claim
   */
  parts: Array<string>
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

export type Location = {
  _id?: string
  peerId: definitions['pin_location']['peer_id']
  ipfsPeerId?: definitions['pin_location']['ipfs_peer_id']
  peerName?: definitions['pin_location']['peer_name']
  region?: definitions['pin_location']['region']
}

export type ListUploadReturn = {
  count: number,
  uploads: UploadItemOutput[],
}

// Pinning

// PsaPinRequest
export type PsaPinRequestUpsertInput = {
  id?: string,
  name?: definitions['psa_pin_request']['name'],
  origins?: definitions['psa_pin_request']['origins'],
  meta?: definitions['psa_pin_request']['meta'],
  authKey: string,
  sourceCid: definitions['psa_pin_request']['source_cid'],
  contentCid: definitions['upload']['content_cid'],
  dagSize?: definitions['content']['dag_size'],
  pins: Array<PinUpsertInput>,
  created?: definitions['upload']['inserted_at'],
  updated?: definitions['upload']['updated_at'],
}

export type PsaPinRequestItem = PsaPinRequestUpsertInput & {
  _id: string,
  contentCid: definitions['psa_pin_request']['content_cid']
  created: definitions['upload']['inserted_at']
  updated: definitions['upload']['updated_at']
  deleted?: definitions['upload']['deleted_at']
  content: ContentItem
}

export type PsaPinRequestUpsertOutput = PsaPinRequestUpsertInput & {
  _id: string,
  contentCid: definitions['psa_pin_request']['content_cid']
  created: definitions['psa_pin_request']['inserted_at']
  updated: definitions['psa_pin_request']['updated_at']
  deleted?: definitions['psa_pin_request']['deleted_at']
  pins: Array<PinItemOutput>
}

export type ListPsaPinRequestOptions = {
  /**
   * Comma-separated list of CIDs to match
   */
  cid?: string[]
  /**
   * Name  to match
   */
  name?: string
   /**
   * Match (default: exact)
   */
  match?: "exact" | "iexact" | "partial" | "ipartial"
  /**
   * status  to match
   */
  statuses?: Array<definitions['pin']['status']>
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
  limit?: number
  /**
   * Metadata key/value JSON object.
   */
  meta?: object,
}

export type ListPsaPinRequestResults = {
  count: number,
  results: Array<PsaPinRequestUpsertOutput>
}

export type NameItem = {
  record: definitions['name']['record']
}

export type StorageUsedOutput = {
  uploaded: number,
  psaPinned: number,
  total: number
}
export type UserStorageUsedInput = {
  fromPercent: number,
  toPercent?: number
}
export type UserStorageUsedOutput = {
  id: string,
  name: string,
  email: string,
  storageQuota: number,
  storageUsed: number,
  percentStorageUsed: number
}
export type Email = {
  type: definitions['email_history']['email_type']
}
export type EmailSentInput = {
  userId: string,
  emailType: string,
  secondsSinceLastSent?: number
}
export type LogEmailSentInput = {
  userId: string,
  emailType: string,
  messageId: string
}

export type ListKeysOptions = {
  includeDeleted: boolean
}
export type AgreementKind = 'web3.storage-tos-v1'
