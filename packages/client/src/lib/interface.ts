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
}

export interface Filelike {
  name: string,
  stream: () => ReadableStream
}

export type PutOptions = {
  onRootCidReady?: (cid: CIDString) => void,
  onStoredChunk?: (size: number) => void,
  maxRetries?: number
}

export interface Web3File extends File {
  cid: CID,
}

export interface Web3Response extends Response {
  unixFsIterator: () => AsyncIterable<UnixFSEntry>
  files: () => Promise<Array<Web3File>>
}
