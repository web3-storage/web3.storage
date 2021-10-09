import { gql } from 'graphql-request'
import { RequestDocument } from 'graphql-request/dist/types'

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
  BackupOutput
} from './db-client-types'

export { gql }

export class DBClient {
  constructor(config: { endpoint?: string; token: string })
  upsertUser (user: UpsertUserInput): Promise<UpsertUserOutput>
  getUser (issuer: string): Promise<UserOutput>
  getUsedStorage (userId: number): Promise<number>
  createUpload (data: CreateUploadInput): Promise<CreateUploadOutput>
  getUpload (cid: string, userId: number): Promise<UploadItemOutput>
  listUploads (userId: number, opts?: ListUploadsOptions): Promise<UploadItemOutput[]>
  renameUpload (cid: string, userId: number, name: string): Promise<{ name: string }>
  deleteUpload(cid: string, userId: number): Promise<{ _id: number }>
  getStatus (cid: string): Promise<ContentItemOutput>
  getBackups(uploadId: number): Promise<Array<BackupOutput>>
  upsertPin (cid: string, pin: PinItemOutput): Promise<number>
  getPins (cid: string): Promise<Array<PinItemOutput>>
  getDeals (cid: string): Promise<Deal[]>
  getDealsForCids (cids: string[]): Promise<Record<string, Deal[]>>
  createKey (key: CreateAuthKeyInput): Promise<CreateAuthKeyOutput>
  getKey (issuer: string, secret: string): Promise<AuthKey>
  listKeys (userId: number): Promise<Array<AuthKeyItemOutput>>
  deleteKey (id: number): Promise<void>
  query<T, V>(document: RequestDocument, variables: V): Promise<T>
}
