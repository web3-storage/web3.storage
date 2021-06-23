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
   * @returns {Promise<API.StatusResult>}
   */
  static async status({ endpoint, token }, cid) {
    const url = new URL(`/roots/${cid}/status`, endpoint)
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: FilecoinStorage.headers(token),
    })
    const result = await response.json()

    if (result.ok) {
      return {
        cid: result.value.cid,
        deals: decodeDeals(result.value.deals),
        size: result.value.size,
        pin: decodePin(result.value.pin),
        created: new Date(result.value.created),
      }
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
    return fetch(url.toString(), {
      method: 'GET',
      headers: FilecoinStorage.headers(token),
    })
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
   * Returns current status of the stored NFT by its CID. Note the NFT must
   * have previously been stored by this account.
   *
   * @example
   * ```js
   * const status = await client.status('Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD')
   * ```
   *
   * @param {string} cid
   */
  status(cid) {
    return FilecoinStorage.status(this, cid)
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
 * @param {API.Deal[]} deals
 * @returns {API.Deal[]}
 */
const decodeDeals = (deals) =>
  deals.map((deal) => {
    const { dealActivation, dealExpiration, lastChanged } = {
      dealExpiration: null,
      dealActivation: null,
      ...deal,
    }

    return {
      ...deal,
      lastChanged: new Date(lastChanged),
      ...(dealActivation && { dealActivation: new Date(dealActivation) }),
      ...(dealExpiration && { dealExpiration: new Date(dealExpiration) }),
    }
  })

/**
 * @param {API.Pin} pin
 * @returns {API.Pin}
 */
const decodePin = (pin) => ({ ...pin, created: new Date(pin.created) })

export { FilecoinStorage, Blob }

/**
 * Just to verify API compatibility.
 * @type {API.API}
 */
const api = FilecoinStorage
void api
