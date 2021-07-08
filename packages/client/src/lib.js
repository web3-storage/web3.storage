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
import { unpackStream } from 'ipfs-car/unpack'
import { TreewalkCarSplitter } from 'carbites/treewalk'
import * as API from './lib/interface.js'
import {
  fetch,
  File,
  Blob,
  Blockstore
} from './platform.js'

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
  static async put({ endpoint, token }, files, { onRootCidReady, onStoredChunk, maxRetries = MAX_PUT_RETRIES, name } = {}) {
    const url = new URL(`/car`, endpoint)
    const targetSize = MAX_CHUNK_SIZE
    let headers = Web3Storage.headers(token)

    if (name) {
      headers = {
        ...headers,
        // @ts-ignore 'X-Name' does not exist in type inferred
        'X-Name': name
      }
    }

    let carRoot
    const blockstore = new Blockstore()

    try {
      const { out, root } = await pack({
        input: Array.from(files).map((f) => ({
          path: f.name,
          content: f.stream()
        })),
        blockstore
      })
      carRoot = root.toString()

      onRootCidReady && onRootCidReady(carRoot)

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
              const res = await request.json()

              if (request.ok) {
                return res.cid
              } else {
                throw new Error(res.message)
              }
            },
            { retries: maxRetries }
          )
          onStoredChunk && onStoredChunk(carFile.size)
          return res
        }
      )

      for await (const _ of upload(splitter.cars())) {}
    } finally {
      // Destroy Blockstore
      await blockstore.destroy()
    }

    return carRoot
  }

  /**
   * @param {API.Service} service
   * @param {string} cid
   * @returns {Promise<import('./lib/interface.js').Web3Response | null>}
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
    return toWeb3Response(res)
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
 * Map a UnixFSEntry to a File with a cid property
 * @param {import('./lib/interface.js').UnixFSEntry} entry
 * @returns {Promise<import('./lib/interface.js').Web3File>}
 */
async function toWeb3File({content, path, cid}) {
  const chunks = []
  for await (const chunk of content()) {
    chunks.push(chunk)
  }
  const file = new File(chunks, toFilenameWithPath(path))
  return Object.assign(file, { cid })
}

/**
 * Trim the root cid from the path if there is anyting after it.
 * bafy...ic2q/path/to/pinpie.jpg => path/to/pinpie.jpg
 *         bafy...ic2q/pinpie.jpg => pinpie.jpg
 *                    bafk...52zy => bafk...52zy
 * @param {string} unixFsPath
 * @returns {string}
 */
function toFilenameWithPath(unixFsPath) {
  const slashIndex = unixFsPath.indexOf('/')
  return slashIndex === -1 ? unixFsPath : unixFsPath.substring(slashIndex + 1)
}

/**
 * Add car unpacking smarts to the response object,
 * @param {Response} res
 * @returns {import('./lib/interface.js').Web3Response}
 */
function toWeb3Response(res) {
  const response = Object.assign(res, {
    unixFsIterator: async function* () {
      /* c8 ignore next 3 */
      if (!res.body) {
        throw new Error('No body on response')
      }
      const blockstore = new Blockstore()
      try {
        for await (const entry of unpackStream(res.body, {blockstore})) {
          yield entry
        }
      } finally {
        await blockstore.destroy()
      }
    },
    files: async () => {
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
    },
  })
  return response
}

export { Web3Storage, File, Blob }

/**
 * Just to verify API compatibility.
 * @type {API.API}
 */
const api = Web3Storage
void api
