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
    return {
      cid,
      getFiles: () => 'not yet',
      getCar: () => res.blob(),
    }
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

export { FilecoinStorage, Blob }

/**
 * Just to verify API compatibility.
 * @type {API.API}
 */
const api = FilecoinStorage
void api
