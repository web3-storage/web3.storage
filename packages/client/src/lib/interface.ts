import type { UnixFSEntry } from 'ipfs-car/unpack'
import type { CID } from 'multiformats'
import type { Web3File } from 'web3-file'
export type { CID , UnixFSEntry, Web3File }


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
    files: Iterable<Web3File>,
    options?: { onStoredChunk?: (size: number) => void }
  ): Promise<CIDString>
    
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
