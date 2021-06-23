import type { CID } from 'multiformats'

export type { CID }

/**
 * Define nominal type of U based on type of T. Similar to Opaque types in Flow
 */
export type Tagged<T, Tag> = T & { tag?: Tag }

export interface Service {
  endpoint: URL
  token: string
}

export interface PublicService {
  endpoint: URL
}

/**
 * CID in string representation
 */
export type CIDString = Tagged<string, CID>

export interface API {
  /**
   * Stores a single file and returns a corresponding CID.
   */
  store(service: Service, content: Blob | File): Promise<CIDString>
  /**
   * Returns current status of the stored NFT by its CID. Note the NFT must
   * have previously been stored by this account.
   */
  status(service: Service, cid: string): Promise<StatusResult>
}

export interface StatusResult {
  cid: string
  size: number
  deals: Deal[]
  pin: Pin
  created: Date
}

export type Deal =
  | QueuedDeal
  | PendingDeal
  | FailedDeal
  | PublishedDeal
  | FinalizedDeal

export interface DealInfo {
  lastChanged: Date
  /**
   * Miner ID
   */
  miner: string

  /**
   * Filecoin network for this Deal
   */
  network?: 'nerpanet' | 'mainnet'
  /**
   * Piece CID string
   */
  pieceCid: CIDString
  /**
   * CID string
   */
  batchRootCid: CIDString
}

export interface QueuedDeal {
  status: 'queued'
  /**
   * Timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: YYYY-MM-DDTHH:MM:SSZ.
   */
  lastChanged: Date
}

export interface PendingDeal extends DealInfo {
  status: 'proposing' | 'accepted'
}

export interface FailedDeal extends DealInfo {
  status: 'failed'
  /**
   * Reason deal failed.
   */
  statusText: string
}

export interface PublishedDeal extends DealInfo {
  status: 'published'
  /**
   * Identifier for the deal stored on chain.
   */
  chainDealID: number
}

export interface FinalizedDeal extends DealInfo {
  status: 'active' | 'terminated'
  /**
   * Identifier for the deal stored on chain.
   */
  chainDealID: number

  /**
   * Deal Activation
   */
  dealActivation: Date
  /**
   * Deal Expiraction
   */
  dealExpiration: Date
}

export interface Pin {
  // Pinata does not provide this
  // requestid: string
  cid: CIDString
  name?: string
  status: PinStatus
  created: Date
}

export type PinStatus = 'queued' | 'pinning' | 'pinned' | 'failed'
