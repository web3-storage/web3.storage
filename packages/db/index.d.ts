import { PostgrestClient } from '@supabase/postgrest-js'
import { DATE_TIME_PAGE_REQUEST, PAGE_NUMBER_PAGE_REQUEST } from './constants.js'

import type {
  UpsertUserInput,
  UpsertUserOutput,
  UserOutput,
  CreateUploadInput,
  ListUploadReturn,
  CreateUploadOutput,
  UploadItemOutput,
  ContentItemOutput,
  Deal,
  CreateAuthKeyInput,
  CreateAuthKeyOutput,
  AuthKey,
  AuthKeyItemOutput,
  PinItemOutput,
  PinSyncRequestOutput,
  PinUpsertInput,
  PinsUpsertInput,
  BackupOutput,
  PsaPinRequestItem,
  PsaPinRequestUpsertOutput,
  PsaPinRequestUpsertInput,
  ListPsaPinRequestOptions,
  ListPsaPinRequestResults,
  StorageUsedOutput,
  UserTagInput,
  UserTagInfo,
  EmailSentInput,
  LogEmailSentInput,
  GetUserOptions,
  ListKeysOptions,
  AgreementKind,
} from './db-client-types'

export class DBClient {
  constructor(config: { endpoint?: string; token: string, postgres?: boolean })
  client: PostgrestClient
  getMetricsValue (key: string): Promise<{ total: number }>
  upsertUser (user: UpsertUserInput): Promise<UpsertUserOutput>
  getUser(issuer: string, options: GetUserOptions): Promise<UserOutput>
  getUserByEmail (email: string): Promise<UserOutput>
  getStorageUsed (userId: number): Promise<StorageUsedOutput>
  emailHasBeenSent(email: EmailSentInput): Promise<boolean>
  logEmailSent(email : LogEmailSentInput): Promise<{id: string}>
  createUpload (data: CreateUploadInput): Promise<CreateUploadOutput>
  getUpload (cid: string, userId: number): Promise<UploadItemOutput>
  listUploads (userId: number, pageRequest: PageRequest): Promise<ListUploadReturn>
  renameUpload (userId: number, cid: string, name: string): Promise<{ name: string }>
  deleteUpload (userId: number, cid: string): Promise<{ _id: number }>
  getStatus (cid: string): Promise<ContentItemOutput>
  getBackups (uploadId: number): Promise<Array<BackupOutput>>
  upsertPin (cid: string, pin: PinUpsertInput): Promise<number>
  upsertPins (pins: Array<PinsUpsertInput>): Promise<void>
  getPins (cid: string): Promise<Array<PinItemOutput>>
  createPinSyncRequests (pinSyncRequests: Array<string>): Promise<void>
  getPinSyncRequests ({ to, after, size }: { to?: string, after?: string, size?: number }): Promise<PinSyncRequestOutput>
  deletePinSyncRequests (ids: Array<string>): Promise<void>
  getDeals (cid: string): Promise<Deal[]>
  getDealsForCids (cids: string[]): Promise<Record<string, Deal[]>>
  createKey (key: CreateAuthKeyInput): Promise<CreateAuthKeyOutput>
  getKey (issuer: string, secret: string): Promise<AuthKey>
  listKeys (userId: string, opts?: ListKeysOptions): Promise<Array<AuthKeyItemOutput>>
  createPsaPinRequest (pinRequest: PsaPinRequestUpsertInput): Promise<PsaPinRequestUpsertOutput>
  getPsaPinRequest (authKey: string, pinRequestId: string) : Promise<PsaPinRequestUpsertOutput>
  listPsaPinRequests (authKey: string, opts?: ListPsaPinRequestOptions ) : Promise<ListPsaPinRequestResults>
  deletePsaPinRequest (pinRequestId: string, authKey: Array<string>) : Promise<PsaPinRequestItem>
  deleteKey (userId: number, keyId: number): Promise<void>
  query<T, V>(document: RequestDocument, variables: V): Promise<T>
  createUserTag(userId: string, tag: UserTagInput): Promise<boolean>
  getUserTags(userId: string): Promise<UserTagInfo[]>
  upsertUserCustomer(userId: string, customerId: string): Promise<void>
  createUserAgreement(userId: string, agreement: AgreementKind): Promise<void>
  getUserCustomer(userId: string): Promise<{ id: string }|null>
  checkIsTokenBlocked(token: CreateAuthKeyOutput): Promise<boolean>
}

export function parseTextToNumber(n: string): number
export * from './constants.js'

/**
 * Request for a paginated page of data.
 */
export type PageRequest = BeforeDatePageRequest|PageNumberPageRequest

/**
 * A pagination page request that is before a specific date.
 */
export interface BeforeDatePageRequest {
  before: Date
  size?: number
}

/**
 * A pagination page request that for a specific page number.
 */
export interface PageNumberPageRequest {
  page: number
  size?: number
  sortBy?: SortField
  sortOrder?: SortOrder
}

export type SortField = 'Name'|'Date'
export type SortOrder = 'Asc'|'Desc'
