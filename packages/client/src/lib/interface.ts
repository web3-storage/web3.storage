import type { UnixFSEntry } from 'ipfs-car/unpack'
import type { CID } from 'multiformats'
export type { CID, UnixFSEntry }

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
   * Stores files and returns a corresponding CID.
   */
  put(
    service: Service,
    files: Iterable<Filelike>,
    options?: PutOptions
  ): Promise<CIDString>

  /**
   * Get files for a root CID packed as a CAR file
   */
  get(service: Service, cid: CIDString): Promise<Web3Response | null>

  /**
   * Remove a users record of an upload. Does not make CID unavailable.
   */
  delete(service: Service, cid: CIDString): Promise<CIDString>

  /**
   * Get info on Filecoin deals and IPFS pins that a CID is replicated in.
   */
  status(service: Service, cid: CIDString): Promise<Status | undefined>
}

export interface Filelike {
  name: string,
  stream: () => ReadableStream
}

export type PutOptions = {
  onRootCidReady?: (cid: CIDString) => void,
  onStoredChunk?: (size: number) => void,
  maxRetries?: number,
  name?: string
}

export interface Web3File extends File {
  cid: CIDString,
}

export interface Web3Response extends Response {
  unixFsIterator: () => AsyncIterable<UnixFSEntry>
  files: () => Promise<Array<Web3File>>
}

export interface Pin {
  peerId: string,
  peerName: string,
  region: string,
  status: 'Pinned' | 'Pinning' | 'PinQueued',
  updated: string
}

export interface Deal {
  dealId: number,
  miner: string,
  status: 'Queued' | 'Published' | 'Active'
  pieceCid: string,
  dataCid: string,
  dataModelSelector: string,
  activation: string,
  created: string
  updated: string
}

export interface Status {
  cid: CIDString
  dagSize: number,
  created: string,
  pins: Array<Pin>
  deals: Array<Deal>
}
