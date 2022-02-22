import { gql } from 'graphql-request'
import { RequestDocument } from 'graphql-request/dist/types'
import { PostgrestClient } from '@supabase/postgrest-js'

import type {
  UpsertUserInput,
  UpsertUserOutput,
  UserOutput,
  CreateUploadInput,
  ListUploadsOptions,
  CreateUploadOutput,
  UploadItemOutput,
  ContentItemOutput,
  Deal,
  CreateAuthKeyInput,
  CreateAuthKeyOutput,
  AuthKey,
  AuthKeyItemOutput,
  PinItemOutput,
  PinRequestItemOutput,
  PinSyncRequestOutput,
  PinUpsertInput,
  PinsUpsertInput,
  BackupOutput,
  PsaPinRequestItem,
  PsaPinRequestUpsertOutput,
  PsaPinRequestUpsertInput,
  ContentInput,
  ListPsaPinRequestOptions,
  ListPsaPinRequestResults,
} from './db-client-types'

export { gql }

export class DBClient {
  constructor(config: { endpoint?: string; token: string, postgres?: boolean })
  client: PostgrestClient
  upsertUser (user: UpsertUserInput): Promise<UpsertUserOutput>
  getUser (issuer: string): Promise<UserOutput>
  getUsedStorage (userId: number): Promise<number>
  createUpload (data: CreateUploadInput): Promise<CreateUploadOutput>
  getUpload (cid: string, userId: number): Promise<UploadItemOutput>
  listUploads (userId: number, opts?: ListUploadsOptions): Promise<UploadItemOutput[]>
  renameUpload (userId: number, cid: string, name: string): Promise<{ name: string }>
  deleteUpload (userId: number, cid: string): Promise<{ _id: number }>
  getStatus (cid: string): Promise<ContentItemOutput>
  getBackups (uploadId: number): Promise<Array<BackupOutput>>
  upsertPin (cid: string, pin: PinUpsertInput): Promise<number>
  upsertPins (pins: Array<PinsUpsertInput>): Promise<void>
  getPins (cid: string): Promise<Array<PinItemOutput>>
  getPinRequests ({ size }: { size: number }): Promise<Array<PinRequestItemOutput>>
  deletePinRequests (ids: Array<number>): Promise<void>
  createPinSyncRequests (pinSyncRequests: Array<string>): Promise<void>
  getPinSyncRequests ({ to, after, size }: { to: string, after?: string, size?: number }): Promise<PinSyncRequestOutput>
  deletePinSyncRequests (ids: Array<string>): Promise<void>
  getDeals (cid: string): Promise<Deal[]>
  getDealsForCids (cids: string[]): Promise<Record<string, Deal[]>>
  createKey (key: CreateAuthKeyInput): Promise<CreateAuthKeyOutput>
  getKey (issuer: string, secret: string): Promise<AuthKey>
  listKeys (userId: number): Promise<Array<AuthKeyItemOutput>>
  createPsaPinRequest (pinRequest: PsaPinRequestUpsertInput): Promise<PsaPinRequestUpsertOutput>
  getPsaPinRequest (authKey: string, pinRequestId: string) : Promise<PsaPinRequestUpsertOutput>
  listPsaPinRequests (authKey: string, opts?: ListPsaPinRequestOptions ) : Promise<ListPsaPinRequestResults>
  deletePsaPinRequest (pinRequestId: string, authKey: string) : Promise<PsaPinRequestItem>
  createContent (content: ContentInput, opt?: {updatePinRequests?: boolean}) : Promise<string>
  deleteKey (id: number): Promise<void>
  query<T, V>(document: RequestDocument, variables: V): Promise<T>
}
