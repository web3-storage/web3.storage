import type { UnixFSEntry } from 'ipfs-car/unpack'
import type { CID } from 'multiformats'
export type { CID , UnixFSEntry }

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
   * Get files for a root CID packed as a CAR file
   */
  get(service: Service, cid: CIDString): Promise<CarResponse | null>
}

export interface IpfsFile extends File {
  cid: CIDString,  
}

export interface CarResponse extends Response {
  unixFsIterator: () => AsyncIterable<UnixFSEntry>
  files: () => Promise<Array<IpfsFile>>
}
