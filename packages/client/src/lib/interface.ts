import type { UnixFSEntry } from 'ipfs-car/unpack'
import type { CID } from 'multiformats'
export type { CID, UnixFSEntry }
import type { CarReader } from '@ipld/car/api'
import type { BlockDecoder } from 'multiformats/codecs/interface'
import {
  fetch as _fetch,
} from '../platform'

/**
 * Define nominal type of U based on type of T. Similar to Opaque types in Flow
 */
export type Tagged<T, Tag> = T & { tag?: Tag }

export interface Service {
  endpoint?: URL
  token: string
  rateLimiter?: RateLimiter
  fetch?: typeof _fetch
}

/**
 * CID in string representation.
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
   * Uploads a CAR ([Content Addressed Archive](https://github.com/ipld/specs/blob/master/block-layer/content-addressable-archives.md)) file to web3.storage.
   */
  putCar(
    service: Service,
    car: CarReader,
    options?: PutCarOptions
  ): Promise<CIDString>

  /**
   * Get files for a root CID packed as a CAR file
   */
  get(service: Service, cid: CIDString): Promise<Web3Response | null>

  /**
   * Remove a users record of an upload. Does not make CID unavailable.
   */
  delete(service: Service, cid: CIDString, options?: RequestOptions): Promise<CIDString>

  /**
   * Get info on Filecoin deals and IPFS pins that a CID is replicated in.
   */
  status(service: Service, cid: CIDString, options?: RequestOptions): Promise<Status | undefined>

  /**
   * Find all uploads for this account. Use a `for await...of` loop to fetch them all.
   * @example
   * Fetch all the uploads
   * ```js
   * const uploads = []
   * for await (const item of client.list()) {
   *    uploads.push(item)
   * }
   * ```
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of}
   */
  list(service: Service, options?: ListOptions):  AsyncIterable<Upload>
}

export interface Filelike {
  /**
   * Name of the file. May include path information.
   */
  name: string
  /**
   * Returns a ReadableStream which upon reading returns the data contained
   * within the File.
   */
  stream: () => ReadableStream
}

export type RequestOptions = {
  /**
   * A signal that can be used to abort the request.
   */
  signal?: AbortSignal
}

export type PutOptions = RequestOptions & {
  /**
   * Callback called after the data has been assembled into a DAG, but before
   * any upload requests begin. It is passed the CID of the root node of the
   * graph.
   */
  onRootCidReady?: (cid: CIDString) => void
  /**
   * Callback called after each chunk of data has been uploaded. By default,
   * data is split into chunks of around 10MB. It is passed the actual chunk
   * size in bytes.
   */
  onStoredChunk?: (size: number) => void
  /**
   * Maximum times to retry a failed upload. Default: 5
   */
  maxRetries?: number
  /**
   * Maximum chunk size to upload in bytes. Default: 10,485,760
   */
  maxChunkSize?: number
  /**
   * Should input files be wrapped with a directory? Default: true
   *
   * It is enabled by default as it preserves the input filenames in DAG;
   * the filenames become directory entries in the generated wrapping dir.
   *
   * The trade off is your root CID will be that of the wrapping dir,
   * rather than the input file itself.
   *
   * For a single file e.g. `cat.png` it's IPFS path would be
   * `<wrapping dir cid>/cat.png` rather than just `<cid for cat.png>`
   *
   * Wrapping with a directory is required when passing multiple files
   * that do not share the same root.
   */
  wrapWithDirectory?: boolean
  /**
   * Human readable name for this upload, for use in file listings.
   */
  name?: string
}

export type PutCarOptions = RequestOptions & {
  /**
   * Human readable name for this upload, for use in file listings.
   */
   name?: string
  /**
   * Callback called after each chunk of data has been uploaded. By default,
   * data is split into chunks of around 10MB. It is passed the actual chunk
   * size in bytes.
   */
   onStoredChunk?: (size: number) => void
  /**
   * Maximum times to retry a failed upload. Default: 5
   */
   maxRetries?: number
  /**
   * Maximum chunk size to upload in bytes. Default: 10,485,760
   */
   maxChunkSize?: number
   /**
    * Additional IPLD block decoders. Used to interpret the data in the CAR file
    * and split it into multiple chunks. Note these are only required if the CAR
    * file was not encoded using the default encoders: `dag-pb`, `dag-cbor` and
    * `raw`.
    */
   decoders?: BlockDecoder<any, any>[]
}

export type ListOptions = RequestOptions & {
  /**
   * Return items uploaded before this ISO 8601 date string.
   * Default: `new Date().toISOString()`.
   */
  before?: string
  /**
   * Maximum number of results to return.
   * Default: `Infinity`.
   */
  maxResults?: number
}

export interface Web3File extends File {
  /**
   * Content Identifier for the file data.
   */
  cid: CIDString
}

export interface Web3Response extends Response {
  unixFsIterator: () => AsyncIterable<UnixFSEntry>
  files: () => Promise<Array<Web3File>>
}

export interface Pin {
  /**
   * Libp2p peer ID of the node pinning the data.
   */
  peerId: string
  /**
   * Human readable name for the peer pinning the data.
   */
  peerName: string
  /**
   * Approximate geographical region of the node pinning the data.
   */
  region: string
  /**
   * Pinning status on this peer.
   */
  status: 'Pinned' | 'Pinning' | 'PinQueued'
  /**
   * Updated date in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
   */
  updated: string
}

export interface Deal {
  /**
   * On-chain ID of the deal.
   */
  dealId: number
  /**
   * Address of the provider storing this data.
   */
  storageProvider: string
  /**
   * Current deal status.
   */
  status: 'Queued' | 'Published' | 'Active'
  /**
   * Filecoin [Piece CID](https://spec.filecoin.io/systems/filecoin_files/piece/) of the data in the deal.
   */
  pieceCid: string
  /**
   * CID of the data aggregated in this deal.
   */
  dataCid: string
  /**
   * Selector for extracting stored data from the aggregated data root.
   */
  dataModelSelector: string
  /**
   * Date when the deal will become active in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
   */
  activation: string
  /**
   * Creation date in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
   */
  created: string
  /**
   * Updated date in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
   */
  updated: string
}

export interface Status {
  /**
   * Content Identifier for the data.
   */
  cid: CIDString
  /**
   * Total size of the DAG in bytes.
   */
  dagSize: number
  /**
   * Creation date in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
   */
  created: string
  /**
   * IPFS peers this data is being pinned on.
   */
  pins: Array<Pin>
  /**
   * Filecoin deals this data appears in.
   */
  deals: Array<Deal>
}

export interface Upload extends Status {
  name: string
}

/**
 * RateLimiter returns a promise that resolves when it is safe to send a request
 * that does not exceed the rate limit.
 */
export interface RateLimiter {
  (): Promise<void>
}
