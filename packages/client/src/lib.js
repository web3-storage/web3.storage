/**
 * A client library for the https://filecoin.storage/ service. It provides a convenient
 * interface for working with the [Raw HTTP API](https://filecoin.storage/#api-docs)
 * from a web browser or [Node.js](https://nodejs.org/) and comes bundled with
 * TS for out-of-the box type inference and better IntelliSense.
 *
 * @example
 * ```js
 * import { FilecoinStorage, Blob } from "filecoin.storage"
 * const client = new FilecoinStorage({ token: API_TOKEN })
 *
 * const cid = await client.storeBlob(new Blob(['hello world']))
 * ```
 * @module
 */
import * as API from './lib/interface.js'
import { fetch, Blob } from './platform.js'
import { CarReader } from '@ipld/car/reader'
import { unpack } from 'ipfs-car/unpack'
import toIterable from 'browser-readablestream-to-it'

/**
 * @implements API.Service
 */
class FilecoinStorage {
  /**
   * Constructs a client bound to the given `options.token` and
   * `options.endpoint`.
   *
   * @example
   * ```js
   * import { FilecoinStorage, Blob } from "filecoin.storage"
   * const client = new FilecoinStorage({ token: API_TOKEN })
   * const { car, rootCid } = await client.pack(new Blob(['hello world']))
   * const cid = await client.store(car)
   * console.assert(cid === rootCid, 'The service should store the files with the `rootCid` I created')
   * ```
   * Optionally you could pass an alternative API endpoint (e.g. for testing)
   * @example
   * ```js
   * import { FilecoinStorage } from "filecoin.storage"
   * const client = new FilecoinStorage({
   *   token: API_TOKEN
   *   endpoint: new URL('http://localhost:8080/')
   * })
   * ```
   *
   * @param {{token: string, endpoint?:URL}} options
   */
  constructor({ token, endpoint = new URL('https://api.filecoin.storage') }) {
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
      'X-Client': 'filecoin.storage',
    }
  }

  /**
   * @param {API.Service} service
   * @param {Blob} blob
   * @returns {Promise<API.CIDString>}
   */
  static async store({ endpoint, token }, blob) {
    const url = new URL(`/car`, endpoint)

    if (blob.size === 0) {
      throw new Error('Content size is 0, make sure to provide some content')
    }

    const car =
      blob.type !== 'application/car'
        ? blob.slice(0, blob.size, 'application/car')
        : blob

    const request = await fetch(url.toString(), {
      method: 'POST',
      headers: FilecoinStorage.headers(token),
      body: car,
    })
    const result = await request.json()

    if (result.ok) {
      return result.value.cid
    } else {
      throw new Error(result.error.message)
    }
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
      headers: FilecoinStorage.headers(token),
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
   * Stores files encoded as a single [Content Addressed Archive
   * (CAR)](https://github.com/ipld/specs/blob/master/block-layer/content-addressable-archives.md).
   *
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
   * @param {Blob} blob
   */
  store(blob) {
    return FilecoinStorage.store(this, blob)
  }

  /**
   * Fetch the Content Addressed Archive by it's root CID
   * @param {string} cid
   */
  get(cid) {
    return FilecoinStorage.get(this, cid)
  }
}

/**
 * Upgrade a ReadableStream to an AsyncIterable if it itn't already
 *
 * ReadableStream (e.g res.body) is asyncIterable in node, but not in chrome, yet.
 * see: https://bugs.chromium.org/p/chromium/issues/detail?id=929585
 *
 * @param {ReadableStream<Uint8Array> | ReadableStream<Uint8Array> & AsyncIterable<Uint8Array>} readable
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
    // @ts-ignore mtime should exist
    lastModified: e.mtime
      ? /* c8 ignore next */ // @ts-ignore
        e.mtime.secs * 1000
      : Date.now(),
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
    filesIterator: async function* () {
      /* c8 ignore next 3 */
      if (!res.body) {
        throw new Error('No body on response')
      }
      const carReader = await CarReader.fromIterable(asAsyncIterable(res.body))
      for await (const entry of unpack(carReader)) {
        yield toIpfsFile(entry)
      }
    },
    files: async () => {
      const files = []
      // @ts-ignore we're using the enriched response here
      for await (const file of res.filesIterator()) {
        files.push(file)
      }
      return files
    },
  })
  return response
}

export { FilecoinStorage, Blob }

/**
 * Just to verify API compatibility.
 * @type {API.API}
 */
const api = FilecoinStorage
void api
