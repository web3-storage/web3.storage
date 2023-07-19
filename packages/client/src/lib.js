/**
 * A client library for the https://web3.storage/ service. It provides a convenient
 * interface for working with the [Raw HTTP API](https://web3.storage/#api-docs)
 * from a web browser or [Node.js](https://nodejs.org/) and comes bundled with
 * TS for out-of-the box type inference and better IntelliSense.
 *
 * @example
 * ```js
 * import { Web3Storage, File } from 'web3.storage'
 * const client = new Web3Storage({ token: API_TOKEN })
 *
 * const cid = await client.put([new File(['hello world'], 'hello.txt', { type: 'text/plain' })])
 * ```
 * @module
 */
import { transform } from 'streaming-iterables'
import pRetry, { AbortError } from 'p-retry'
import { pack } from 'ipfs-car/pack'
import { parseLinkHeader } from '@web3-storage/parse-link-header'
import { unpackStream } from 'ipfs-car/unpack'
import { TreewalkCarSplitter } from 'carbites/treewalk'
import { CarReader } from '@ipld/car'
import { filesFromPath, getFilesFromPath } from 'files-from-path'
import throttledQueue from 'throttled-queue'
import {
  fetch as _fetch,
  File,
  Blob,
  Blockstore
} from './platform.js'

const MAX_PUT_RETRIES = 5
const MAX_CONCURRENT_UPLOADS = 3
const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 50 // chunk to ~50MB CARs
const MAX_BLOCK_SIZE = 1048576
const MAX_CHUNK_SIZE = 104857600
// These match what is enforced server-side
const RATE_LIMIT_REQUESTS = 30
const RATE_LIMIT_PERIOD = 10 * 1000

/** @typedef { import('./lib/interface.js').API } API */
/** @typedef { import('./lib/interface.js').Status} Status */
/** @typedef { import('./lib/interface.js').Upload} Upload */
/** @typedef { import('./lib/interface.js').Deal} Deal */
/** @typedef { import('./lib/interface.js').Pin} Pin */
/** @typedef { import('./lib/interface.js').Service } Service */
/** @typedef { import('./lib/interface.js').Web3File} Web3File */
/** @typedef { import('./lib/interface.js').Filelike } Filelike */
/** @typedef { import('./lib/interface.js').CIDString} CIDString */
/** @typedef { import('./lib/interface.js').RequestOptions} RequestOptions */
/** @typedef { import('./lib/interface.js').PutOptions} PutOptions */
/** @typedef { import('./lib/interface.js').PutCarOptions} PutCarOptions */
/** @typedef { import('./lib/interface.js').ListOptions} ListOptions */
/** @typedef { import('./lib/interface.js').RateLimiter } RateLimiter */
/** @typedef { import('./lib/interface.js').UnixFSEntry} UnixFSEntry */
/** @typedef { import('./lib/interface.js').Web3Response} Web3Response */

/**
 * Creates a rate limiter which limits at the same rate as is enforced
 * server-side, to allow the client to avoid exceeding the requests limit and
 * being blocked for 30 seconds.
 * @returns {RateLimiter}
 */
export function createRateLimiter () {
  const throttle = throttledQueue(RATE_LIMIT_REQUESTS, RATE_LIMIT_PERIOD)
  return () => throttle(() => {})
}

/**
 * Rate limiter used by static API if no rate limiter is passed. Note that each
 * instance of the Web3Storage class gets it's own limiter if none is passed.
 * This is because rate limits are enforced per API token.
 */
const globalRateLimiter = createRateLimiter()

/**
 * @implements Service
 */
class Web3Storage {
  /**
   * Constructs a client bound to the given `options.token` and
   * `options.endpoint`.
   *
   * @example
   * ```js
   * import { Web3Storage } from 'web3.storage'
   * const client = new Web3Storage({ token: API_TOKEN })
   * ```
   *
    @param {Service} options
   */
  constructor ({
    token,
    endpoint = new URL('https://api.web3.storage'),
    rateLimiter,
    fetch = _fetch
  }) {
    /**
     * Authorization token.
     *
     * @readonly
     */
    this.token = token
    /**
     * Service API endpoint `URL`.
     * @readonly
     */
    this.endpoint = endpoint
    /**
     * @readonly
     */
    this.rateLimiter = rateLimiter || createRateLimiter()
    /**
     * Optional custom fetch function. Defaults to global fetch in browsers or @web-std/fetch on node.
     * @readonly
     */
    this.fetch = fetch
  }

  /**
   * @hidden
   * @param {string} token
   * @returns {Record<string, string>}
   */
  static headers (token) {
    if (!token) throw new Error('missing token')
    return {
      Authorization: `Bearer ${token}`,
      'X-Client': 'web3.storage/js'
    }
  }

  /**
   * @param {Service} service
   * @param {Iterable<Filelike>} files
   * @param {PutOptions} [options]
   * @returns {Promise<CIDString>}
   */
  static async put ({ endpoint, token, rateLimiter = globalRateLimiter, fetch = _fetch }, files, {
    onRootCidReady,
    onStoredChunk,
    maxRetries = MAX_PUT_RETRIES,
    maxChunkSize = DEFAULT_CHUNK_SIZE,
    wrapWithDirectory = true,
    name,
    signal
  } = {}) {
    if (maxChunkSize >= MAX_CHUNK_SIZE || maxChunkSize < MAX_BLOCK_SIZE) {
      throw new Error('maximum chunk size must be less than 100MiB and greater than or equal to 1MB')
    }
    const blockstore = new Blockstore()
    try {
      const { out, root } = await pack({
        input: Array.from(files).map(toImportCandidate),
        blockstore,
        wrapWithDirectory,
        maxChunkSize: MAX_BLOCK_SIZE,
        maxChildrenPerNode: 1024
      })
      onRootCidReady && onRootCidReady(root.toString())
      const car = await CarReader.fromIterable(out)
      return await Web3Storage.putCar({ endpoint, token, rateLimiter, fetch }, car, { onStoredChunk, maxRetries, maxChunkSize, name, signal })
    } finally {
      await blockstore.close()
    }
  }

  /**
   * @param {Service} service
   * @param {import('@ipld/car/api').CarReader} car
   * @param {PutCarOptions} [options]
   * @returns {Promise<CIDString>}
   */
  static async putCar ({ endpoint, token, rateLimiter = globalRateLimiter, fetch = _fetch }, car, {
    name,
    onStoredChunk,
    maxRetries = MAX_PUT_RETRIES,
    maxChunkSize = DEFAULT_CHUNK_SIZE,
    decoders,
    signal
  } = {}) {
    if (maxChunkSize >= MAX_CHUNK_SIZE || maxChunkSize < MAX_BLOCK_SIZE) {
      throw new Error('maximum chunk size must be less than 100MiB and greater than or equal to 1MB')
    }
    const targetSize = maxChunkSize
    const url = new URL('car', endpoint)
    const headers = {
      ...Web3Storage.headers(token),
      'Content-Type': 'application/vnd.ipld.car',
      ...(name ? { 'X-Name': encodeURIComponent(name) } : {})
    }

    const roots = await car.getRoots()
    if (roots[0] == null) {
      throw new Error('missing root CID')
    }
    if (roots.length > 1) {
      throw new Error('too many roots')
    }

    const carRoot = roots[0].toString()
    const splitter = new TreewalkCarSplitter(car, targetSize, { decoders })

    /**
     * @param {AsyncIterable<Uint8Array>} car
     * @returns {Promise<CIDString>}
     */
    const onCarChunk = async car => {
      const carParts = []
      for await (const part of car) {
        carParts.push(part)
      }

      const carFile = new Blob(carParts, { type: 'application/vnd.ipld.car' })

      /** @type {Blob|ArrayBuffer} */
      let body = carFile
      // FIXME: should not be necessary to await arrayBuffer()!
      // Node.js 20 hangs reading the stream (it never ends) but in
      // older node versions and the browser it is fine to pass a blob.
      /* c8 ignore next 3 */
      if (parseInt(globalThis.process?.versions?.node) > 18) {
        body = await body.arrayBuffer()
      }

      const res = await pRetry(
        async () => {
          await rateLimiter()
          /** @type {Response} */
          let response
          try {
            response = await fetch(url.toString(), {
              method: 'POST',
              headers,
              body,
              signal
            })
          } catch (/** @type {any} */err) {
            throw signal && signal.aborted ? new AbortError(err) : err
          }
          /* c8 ignore next 3 */
          if (response.status === 429) {
            throw new Error('rate limited')
          }
          const res = await response.json()
          if (!response.ok) {
            throw new Error(res.message)
          }

          if (res.cid !== carRoot) {
            throw new Error(`root CID mismatch, expected: ${carRoot}, received: ${res.cid}`)
          }
          return res.cid
        },
        { retries: maxRetries }
      )

      onStoredChunk && onStoredChunk(carFile.size)
      return res
    }

    const upload = transform(MAX_CONCURRENT_UPLOADS, onCarChunk)
    for await (const _ of upload(splitter.cars())) {} // eslint-disable-line
    return carRoot
  }

  /**
   * @param {Service} service
   * @param {CIDString} cid
   * @param {RequestOptions} [options]
   * @returns {Promise<Web3Response | null>}
   */
  static async get ({ endpoint, token, rateLimiter = globalRateLimiter, fetch = _fetch }, cid, options = {}) {
    const url = new URL(`car/${cid}`, endpoint)
    await rateLimiter()
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: Web3Storage.headers(token),
      signal: options.signal
    })
    /* c8 ignore next 3 */
    if (res.status === 429) {
      throw new Error('rate limited')
    }
    return toWeb3Response(res)
  }

  /**
   * @param {Service} service
   * @param {CIDString} cid
   * @param {RequestOptions} [options]
   * @returns {Promise<CIDString>}
   */
  /* c8 ignore next 4 */
  static async delete ({ endpoint, token, rateLimiter = globalRateLimiter }, cid, options = {}) {
    console.log('Not deleting', cid, endpoint, token, rateLimiter, options)
    throw Error('.delete not implemented yet')
  }

  /**
   * @param {Service} service
   * @param {CIDString} cid
   * @param {RequestOptions} [options]
   * @returns {Promise<Status | undefined>}
   */
  static async status ({ endpoint, token, rateLimiter = globalRateLimiter, fetch = _fetch }, cid, options = {}) {
    const url = new URL(`status/${cid}`, endpoint)
    await rateLimiter()
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: Web3Storage.headers(token),
      signal: options.signal
    })
    /* c8 ignore next 3 */
    if (res.status === 429) {
      throw new Error('rate limited')
    }
    if (res.status === 404) {
      return undefined
    }
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.json()
  }

  /**
   * @param {Service} service
   * @param {ListOptions} [opts]
   * @returns {AsyncIterable<Upload>}
   */
  static async * list (service, { before = new Date().toISOString(), maxResults = Infinity, signal } = {}) {
    /**
     * @param {Service} service
     * @param {{before: string, size: number}} opts
     * @returns {Promise<Response>}
     */
    async function listPage ({ endpoint, token, rateLimiter = globalRateLimiter, fetch = _fetch }, { before, size }) {
      const search = new URLSearchParams({ before, size: size.toString() })
      const url = new URL(`user/uploads?${search}`, endpoint)
      await rateLimiter()
      return fetch(url.toString(), {
        method: 'GET',
        headers: {
          ...Web3Storage.headers(token),
          'Access-Control-Request-Headers': 'Link'
        },
        signal
      })
    }
    let count = 0
    const size = maxResults > 100 ? 100 : maxResults
    for await (const res of paginator(listPage, service, { before, size })) {
      if (!res.ok) {
        /* c8 ignore next 3 */
        if (res.status === 429) {
          throw new Error('rate limited')
        }

        /* c8 ignore next 2 */
        const errorMessage = await res.json()
        throw new Error(`${res.status} ${res.statusText} ${errorMessage ? '- ' + errorMessage.message : ''}`)
      }
      const page = await res.json()
      for (const upload of page) {
        if (++count > maxResults) {
          return
        }
        yield upload
      }
    }
  }

  // Just a sugar so you don't have to pass around endpoint and token around.

  /**
   * Uploads files to web3.storage. Files are hashed in the client and uploaded as a single
   * [Content Addressed Archive(CAR)](https://github.com/ipld/specs/blob/master/block-layer/content-addressable-archives.md).
   * Takes a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob)
   *
   * Returns the corresponding Content Identifier (CID).
   *
   * @example
   * ```js
   * const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' })
   * const cid = await client.put([file])
   * ```
   * @param {Iterable<Filelike>} files
   * @param {PutOptions} [options]
   */
  put (files, options) {
    return Web3Storage.put(this, files, options)
  }

  /**
   * Uploads a CAR ([Content Addressed Archive](https://github.com/ipld/specs/blob/master/block-layer/content-addressable-archives.md)) file to web3.storage.
   * Takes a CarReader interface from @ipld/car
   *
   * Returns the corresponding Content Identifier (CID).
   *
   * @example
   * ```js
   * import fs from 'fs'
   * import { Readable } from 'stream'
   * import { CarReader, CarWriter } from '@ipld/car'
   * import * as raw from 'multiformats/codecs/raw'
   * import { CID } from 'multiformats/cid'
   * import { sha256 } from 'multiformats/hashes/sha2'
   *
   * async function getCar() {
   *    const bytes = new TextEncoder().encode('random meaningless bytes')
   *    const hash = await sha256.digest(raw.encode(bytes))
   *    const cid = CID.create(1, raw.code, hash)
   *
   *    // create the writer and set the header with a single root
   *    const { writer, out } = await CarWriter.create([cid])
   *    Readable.from(out).pipe(fs.createWriteStream('example.car'))

   *    // store a new block, creates a new file entry in the CAR archive
   *    await writer.put({ cid, bytes })
   *    await writer.close()

   *    const inStream = fs.createReadStream('example.car')
   *    // read and parse the entire stream in one go, this will cache the contents of
   *    // the car in memory so is not suitable for large files.
   *    const reader = await CarReader.fromIterable(inStream)
   *    return reader
   * }
   *
   * const car = await getCar()
   * const cid = await client.putCar(car)
   * ```
   * @param {import('@ipld/car/api').CarReader} car
   * @param {PutCarOptions} [options]
   */
  putCar (car, options) {
    return Web3Storage.putCar(this, car, options)
  }

  /**
   * Fetch the Content Addressed Archive by its root CID.
   * @param {CIDString} cid
   * @param {RequestOptions} [options]
   */
  get (cid, options) {
    return Web3Storage.get(this, cid, options)
  }

  /**
   * @param {CIDString} cid
   * @param {RequestOptions} [options]
   */
  /* c8 ignore next 3 */
  delete (cid, options) {
    return Web3Storage.delete(this, cid, options)
  }

  /**
   * Fetch info on Filecoin deals and IPFS pins that a given CID is replicated in.
   * @param {CIDString} cid
   * @param {RequestOptions} [options]
   */
  status (cid, options) {
    return Web3Storage.status(this, cid, options)
  }

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
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
   * @param {ListOptions} [opts]
   * @returns {AsyncIterable<Upload>}
   */
  list (opts) {
    return Web3Storage.list(this, opts)
  }
}

/**
 * Map a UnixFSEntry to a File with a cid property.
 *
 * @param {UnixFSEntry} entry
 * @returns {Promise<Web3File>}
 */
async function toWeb3File ({ content, path, cid }) {
  const chunks = []
  for await (const chunk of content()) {
    chunks.push(chunk)
  }
  const file = new File(chunks, toFilenameWithPath(path))
  return Object.assign(file, { cid: cid.toString() })
}

/**
 * Trim the root cid from the path if there is anyting after it.
 * bafy...ic2q/path/to/pinpie.jpg => path/to/pinpie.jpg
 *         bafy...ic2q/pinpie.jpg => pinpie.jpg
 *                    bafk...52zy => bafk...52zy
 * @param {string} unixFsPath
 * @returns {string}
 */
function toFilenameWithPath (unixFsPath) {
  const slashIndex = unixFsPath.indexOf('/')
  return slashIndex === -1 ? unixFsPath : unixFsPath.substring(slashIndex + 1)
}

/**
 * Add car unpacking smarts to the response object,
 * @param {Response} res
 * @returns {Web3Response}
 */
function toWeb3Response (res) {
  const response = Object.assign(res, {
    unixFsIterator: async function * () {
      if (!res.ok) {
        throw new Error(`Response was not ok: ${res.status} ${res.statusText} - Check for { "ok": false } on the Response object before calling .unixFsIterator`)
      }
      /* c8 ignore next 3 */
      if (!res.body) {
        throw new Error('No body on response')
      }
      const blockstore = new Blockstore()
      try {
        for await (const entry of unpackStream(res.body, { blockstore })) {
          yield entry
        }
      } finally {
        await blockstore.close()
      }
    },
    files: async () => {
      if (!res.ok) {
        throw new Error(`Response was not ok: ${res.status} ${res.statusText} - Check for { "ok": false } on the Response object before calling .files`)
      }
      const files = []
      // @ts-ignore we're using the enriched response here
      for await (const entry of response.unixFsIterator()) {
        if (entry.type === 'directory') {
          continue
        }
        const file = await toWeb3File(entry)
        files.push(file)
      }
      return files
    }
  })
  return response
}

/**
 * Convert the passed file to an "import candidate" - an object suitable for
 * passing to the ipfs-unixfs-importer. Note: content is an accessor so that
 * the stream is only created when needed.
 *
 * @param {Filelike} file
 */
function toImportCandidate (file) {
  /** @type {ReadableStream} */
  let stream
  return {
    path: file.name,
    get content () {
      stream = stream || file.stream()
      return stream
    }
  }
}

/**
 * Follow Link headers on a Response, to fetch all the things.
 *
 * @param {(service: Service, opts: any) => Promise<Response>} fn
 * @param {Service} service
 * @param {{}} opts
 */
async function * paginator (fn, service, opts) {
  let res = await fn(service, opts)
  yield res
  let link = parseLinkHeader(res.headers.get('Link') || '')
  // @ts-ignore
  while (link && link.next) {
    // @ts-ignore
    res = await fn(service, link.next)
    yield res
    link = parseLinkHeader(res.headers.get('Link') || '')
  }
}

export { Web3Storage, File, Blob, filesFromPath, getFilesFromPath }

/**
 * Just to verify API compatibility.
 * TODO: convert lib to a regular class that can be type checked.
 * @type {API}
 */
const api = Web3Storage
void api // eslint-disable-line no-void
