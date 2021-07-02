/**
 * A client library for the https://web3.storage/ service. It provides a convenient
 * interface for working with the [Raw HTTP API](https://web3.storage/#api-docs)
 * from a web browser or [Node.js](https://nodejs.org/) and comes bundled with
 * TS for out-of-the box type inference and better IntelliSense.
 *
 * @example
 * ```js
 * import { Web3Storage, Blob } from "web3.storage"
 * const client = new Web3Storage({ token: API_TOKEN })
 *
 * const cid = await client.storeBlob(new Blob(['hello world']))
 * ```
 * @module
 */
import { transform } from 'streaming-iterables'
import pRetry from 'p-retry'
import { pack } from 'ipfs-car/pack'
import { TreewalkCarSplitter } from 'carbites/treewalk'
import * as API from './lib/interface.js'
import {
  fetch,
  Blob,
  Blockstore
} from './platform.js'
import { CarReader } from '@ipld/car/reader'
import { unpack } from 'ipfs-car/unpack'
import toIterable from 'browser-readablestream-to-it'

const MAX_PUT_RETRIES = 5
const MAX_CONCURRENT_UPLOADS = 3
const MAX_CHUNK_SIZE = 1024 * 1024 * 10 // chunk to ~10MB CARs

/**
 * @implements API.Service
 */
class Web3Storage {
  /**
   * Constructs a client bound to the given `options.token` and
   * `options.endpoint`.
   *
   * @example
   * ```js
   * import { Web3Storage, Blob } from "web3.storage"
   * const client = new Web3Storage({ token: API_TOKEN })
   * const { car, rootCid } = await client.pack(new Blob(['hello world']))
   * const cid = await client.store(car)
   * console.assert(cid === rootCid, 'The service should store the files with the `rootCid` I created')
   * ```
   * Optionally you could pass an alternative API endpoint (e.g. for testing)
   * @example
   * ```js
   * import { Web3Storage } from "web3.storage"
   * const client = new Web3Storage({
   *   token: API_TOKEN
   *   endpoint: new URL('http://localhost:8080/')
   * })
   * ```
   *
   * @param {{token: string, endpoint?:URL}} options
   */
  constructor({ token, endpoint = new URL('https://api.web3.storage') }) {
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
  }

  /**
   * @hidden
   * @param {string} token
   */
  static headers(token) {
    if (!token) throw new Error('missing token')
    return {
      Authorization: `Bearer ${token}`,
      'X-Client': 'web3.storage',
    }
  }

  /**
   * @param {API.Service} service
   * @param {Iterable<API.Filelike>} files
   * @param {API.PutOptions} [options]
   * @returns {Promise<API.CIDString>}
   */
  static async put({ endpoint, token }, files, { onStoredChunk, maxRetries = MAX_PUT_RETRIES } = {}) {
    const url = new URL(`/car`, endpoint)
    const headers = Web3Storage.headers(token)
    const targetSize = MAX_CHUNK_SIZE

    let root
    const blockstore = new Blockstore()

    try {
      const { out } = await pack({
        input: Array.from(files).map((f) => ({
          path: f.name,
          content: f.stream()
        })),
        blockstore
      })
      const splitter = await TreewalkCarSplitter.fromIterable(out, targetSize)

      const upload = transform(
        MAX_CONCURRENT_UPLOADS,
        async (/** @type {AsyncIterable<Uint8Array>} */ car) => {
          const carParts = []
          for await (const part of car) {
            carParts.push(part)
          }

          const carFile = new Blob(carParts, {
            type: 'application/car',
          })

          const res = await pRetry(
            async () => {
              const request = await fetch(url.toString(), {
                method: 'POST',
                headers,
                body: carFile,
              })
              const result = await request.json()

              if (result.ok) {
                return result.value.cid
              } else {
                throw new Error(result.error.message)
              }
            },
            { retries: maxRetries }
          )
          onStoredChunk && onStoredChunk(carFile.size)
          return res
        }
      )

      for await (const cid of upload(splitter.cars())) {
        root = cid
      }
    } finally {
      // Destroy Blockstore
      await blockstore.destroy()
    }

    // @ts-ignore there will always be a root, or carbites will fail
    return root
  }

  /**
   * @param {API.Service} service
   * @param {string} cid
   * @returns {Promise<import('./lib/interface.js').CarResponse | null>}
   */
  static async get({ endpoint, token }, cid) {
    const url = new URL(`/car/${cid}`, endpoint)
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: Web3Storage.headers(token),
    })
    if (!res.ok) {
      // TODO: I'm assuming that an error for "CID isn't there (yet)" would be unergonomic. Need to verify.
      // I'm thinking null means, nope, not yet, no can has. Anything else is _AN ERROR_
      if (res.status === 404) {
        return null
      } else {
        throw new Error(`${res.status} ${res.statusText}`)
      }
    }
    return toCarResponse(res)
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
   * const data = 'Hello world'
   * const {root, car} = client.pack('Hello world')
   * const cid = await client.store(car)
   * console.assert(cid === root)
   * ```
   * @param {Iterable<API.Filelike>} files
   * @param {API.PutOptions} [options]
   */
  put(files, options) {
    return Web3Storage.put(this, files, options)
  }

  /**
   * Fetch the Content Addressed Archive by it's root CID
   * @param {string} cid
   */
  get(cid) {
    return Web3Storage.get(this, cid)
  }
}

/**
 * Upgrade a ReadableStream to an AsyncIterable if it isn't already
 *
 * ReadableStream (e.g res.body) is asyncIterable in node, but not in chrome, yet.
 * see: https://bugs.chromium.org/p/chromium/issues/detail?id=929585
 *
 * @param {ReadableStream<Uint8Array>} readable
 * @returns {AsyncIterable<Uint8Array>}
 */
function asAsyncIterable(readable) {
  // @ts-ignore how to tell tsc that we are checking the type here?
  return Symbol.asyncIterator in readable
    ? readable
    : /* c8 ignore next */
      toIterable(readable)
}

/**
 * map a UnixFSEntry to a ~Blob~ File with benefits
 * @param {import('./lib/interface.js').UnixFSEntry} e
 * @returns {Promise<import('./lib/interface.js').IpfsFile>}
 */
async function toIpfsFile(e) {
  const chunks = []
  for await (const chunk of e.content()) {
    chunks.push(chunk)
  }

  // A Blob in File clothing
  const file = Object.assign(new Blob(chunks), {
    cid: e.cid.toString(),
    name: e.name,
    relativePath: e.path,
    webkitRelativePath: e.path,
    // TODO: mtime may be available on UnixFSEntry... need to investigate ts weirdness.
    lastModified: Date.now(),
  })
  return file
}

/**
 * Add car unpacking smarts to the response object,
 * @param {Response} res
 * @returns {import('./lib/interface.js').CarResponse}
 */
function toCarResponse(res) {
  const response = Object.assign(res, {
    unixFsIterator: async function* () {
      /* c8 ignore next 3 */
      if (!res.body) {
        throw new Error('No body on response')
      }
      const carReader = await CarReader.fromIterable(asAsyncIterable(res.body))
      for await (const entry of unpack(carReader)) {
        yield entry
      }
    },
    files: async () => {
      const files = []
      // @ts-ignore we're using the enriched response here
      for await (const entry of response.unixFsIterator()) {
        if (entry.type === 'directory') {
          continue
        }
        const file = await toIpfsFile(entry)
        files.push(file)
      }
      return files
    },
  })
  return response
}

export { Web3Storage, Blob }

/**
 * Just to verify API compatibility.
 * @type {API.API}
 */
const api = Web3Storage
void api
