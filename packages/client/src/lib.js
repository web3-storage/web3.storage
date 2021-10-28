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
import pRetry from 'p-retry'
import { pack } from 'ipfs-car/pack'
import parseLink from 'parse-link-header'
import { unpackStream } from 'ipfs-car/unpack'
import { TreewalkCarSplitter } from 'carbites/treewalk'
import { CarReader } from '@ipld/car'
import { filesFromPath, getFilesFromPath } from 'files-from-path'
import { base64 } from 'multiformats/bases/base64'
import * as Block from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'
import { identity } from 'multiformats/hashes/identity'
import * as dagCbor from '@ipld/dag-cbor'
import { CID } from 'multiformats'
import {
  fetch,
  File,
  Blob,
  Blockstore
} from './platform.js'

const MAX_PUT_RETRIES = 5
const MAX_CONCURRENT_UPLOADS = 3
const MAX_CHUNK_SIZE = 1024 * 1024 * 10 // chunk to ~10MB CARs
const SIGNING_DOMAIN_PREFIX = new TextEncoder().encode('web3-storage-wallet-auth:')

/** @typedef { import('./lib/interface.js').API } API */
/** @typedef { import('./lib/interface.js').Status} Status */
/** @typedef { import('./lib/interface.js').Upload} Upload */
/** @typedef { import('./lib/interface.js').Service } Service */
/** @typedef { import('./lib/interface.js').Web3File} Web3File */
/** @typedef { import('./lib/interface.js').Filelike } Filelike */
/** @typedef { import('./lib/interface.js').CIDString} CIDString */
/** @typedef { import('./lib/interface.js').PutOptions} PutOptions */
/** @typedef { import('./lib/interface.js').PutCarOptions} PutCarOptions */
/** @typedef { import('./lib/interface.js').UnixFSEntry} UnixFSEntry */
/** @typedef { import('./lib/interface.js').Web3Response} Web3Response */
/** @typedef { import('./lib/interface.js').WalletAuthProvider} WalletAuthProvider */
/** @typedef {import('./lib/interface').WalletAuthenticationPayload} WalletAuthenticationPayload */
/** @typedef {import('./lib/interface').ChainContext} ChainContext */
/** @typedef {import('./lib/interface').SupportedKeyType} SupportedKeyType */
/** @typedef {import('./lib/interface').MessageSigner} MessageSigner */
/** @typedef {import('./lib/interface').WalletAuthenticationPayloadSignature} WalletAuthenticationPayloadSignature */
/** @typedef {import('./lib/interface').EncodedWalletAuthenticationPayload} EncodedWalletAuthenticationPayload */

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
   * @param {{token?: string, endpoint?: URL, wallet?: WalletAuthProvider}} options
   */
  constructor ({ token, wallet, endpoint = new URL('https://api.web3.storage') }) {
    /**
     * Authorization token.
     *
     * @readonly
     */
    this.token = token

    /**
     * Wallet authentication provider. Used only if no Authorization token is provided.
     */
    this.wallet = wallet

    /**
     * Service API endpoint `URL`.
     * @readonly
     */
    this.endpoint = endpoint
  }

  /**
   * @hidden
   * @param {string} [token]
   * @param {import('./lib/interface.js').WalletAuthProvider | undefined} [wallet]
   * @param {CIDString} [rootCID]
   * @returns {Promise<Record<string, string>>}
   */
  static async headers (token, wallet, rootCID) {
    if (!token && wallet != null && rootCID != null) {
      const { payload, signature } = await createAndSignWalletAuthPayload(wallet, rootCID)
      const authHeaderValue = `X-Wallet-Signature-${wallet.blockchain}-${wallet.network} ${base64.encode(signature)}`
      return {
        Authorization: authHeaderValue,
        'X-Wallet-Signature-Payload': base64.encode(payload),
        'X-Client': 'web3.storage'
      }
    }

    if (!token) {
      throw new Error('missing token')
    }
    return {
      Authorization: `Bearer ${token}`,
      'X-Client': 'web3.storage'
    }
  }

  /**
   * @param {Service} service
   * @param {Iterable<Filelike>} files
   * @param {PutOptions} [options]
   * @returns {Promise<CIDString>}
   */
  static async put ({ endpoint, token, wallet }, files, {
    onRootCidReady,
    onStoredChunk,
    maxRetries = MAX_PUT_RETRIES,
    wrapWithDirectory = true,
    name
  } = {}) {
    const blockstore = new Blockstore()
    try {
      const { out, root } = await pack({
        input: Array.from(files).map((f) => ({
          path: f.name,
          content: f.stream()
        })),
        blockstore,
        wrapWithDirectory,
        maxChunkSize: 1048576,
        maxChildrenPerNode: 1024
      })
      onRootCidReady && onRootCidReady(root.toString())
      const car = await CarReader.fromIterable(out)
      return await Web3Storage.putCar({ endpoint, token, wallet }, car, { onStoredChunk, maxRetries, name })
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
  static async putCar ({ endpoint, token, wallet }, car, {
    name,
    onStoredChunk,
    maxRetries = MAX_PUT_RETRIES,
    decoders
  } = {}) {
    const targetSize = MAX_CHUNK_SIZE
    const url = new URL('/car', endpoint)

    const roots = await car.getRoots()
    if (roots[0] == null) {
      throw new Error('missing root CID')
    }
    if (roots.length > 1) {
      throw new Error('too many roots')
    }
    const carRoot = roots[0].toString()

    let headers = await Web3Storage.headers(token, wallet, carRoot)
    if (name) {
      headers = { ...headers, 'X-Name': encodeURIComponent(name) }
    }

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

      const carFile = new Blob(carParts, { type: 'application/car' })
      const res = await pRetry(
        async () => {
          const request = await fetch(url.toString(), {
            method: 'POST',
            headers,
            body: carFile
          })
          const res = await request.json()
          if (!request.ok) {
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
   * @returns {Promise<Web3Response | null>}
   */
  static async get ({ endpoint, token }, cid) {
    const url = new URL(`/car/${cid}`, endpoint)
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: await Web3Storage.headers(token)
    })
    return toWeb3Response(res)
  }

  /**
   * @param {Service} service
   * @param {CIDString} cid
   * @returns {Promise<CIDString>}
   */
  /* c8 ignore next 4 */
  static async delete ({ endpoint, token }, cid) {
    console.log('Not deleting', cid, endpoint, token)
    throw Error('.delete not implemented yet')
  }

  /**
   * @param {Service} service
   * @param {CIDString} cid
   * @returns {Promise<Status | undefined>}
   */
  static async status ({ endpoint, token, wallet }, cid) {
    const url = new URL(`/status/${cid}`, endpoint)
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: await Web3Storage.headers(token, wallet, cid)
    })
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
   * @param {object} [opts]
   * @param {string} [opts.before] list items uploaded before this ISO 8601 date string
   * @param {number} [opts.maxResults] maximum number of results to return
   * @returns {AsyncIterable<Upload>}
   */
  static async * list (service, { before = new Date().toISOString(), maxResults = Infinity } = {}) {
  /**
   * @param {Service} service
   * @param {{before: string, size: number}} opts
   * @returns {Promise<Response>}
   */
    function listPage ({ endpoint, token }, { before, size }) {
      const search = new URLSearchParams({ before, size: size.toString() })
      const url = new URL(`/user/uploads?${search}`, endpoint)
      return Web3Storage.headers(token)
        .then(headers => fetch(url.toString(), {
          method: 'GET',
          headers: {
            ...headers,
            'Access-Control-Request-Headers': 'Link'
          }
        }))
    }
    let count = 0
    const size = maxResults > 100 ? 100 : maxResults
    for await (const res of paginator(listPage, service, { before, size })) {
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`)
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
   */
  get (cid) {
    return Web3Storage.get(this, cid)
  }

  /**
   * @param {CIDString} cid
   */
  /* c8 ignore next 3 */
  delete (cid) {
    return Web3Storage.delete(this, cid)
  }

  /**
   * Fetch info on Filecoin deals and IPFS pins that a given CID is replicated in.
   * @param {CIDString} cid
   */
  status (cid) {
    return Web3Storage.status(this, cid)
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
   * @param {object} [opts]
   * @param {string} [opts.before] list items uploaded before this ISO 8601 date string
   * @param {number} [opts.maxResults] maximum number of results to return
   * @returns {AsyncIterable<Upload>}
   */
  list (opts) {
    return Web3Storage.list(this, opts)
  }
}

/**
 * Map a UnixFSEntry to a File with a cid property
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
 * Follow Link headers on a Response, to fetch all the things.
 *
 * @param {(service: Service, opts: any) => Promise<Response>} fn
 * @param {Service} service
 * @param {{}} opts
 */
async function * paginator (fn, service, opts) {
  let res = await fn(service, opts)
  yield res
  let link = parseLink(res.headers.get('Link') || '')
  // @ts-ignore
  while (link && link.next) {
    // @ts-ignore
    res = await fn(service, link.next)
    yield res
    link = parseLink(res.headers.get('Link') || '')
  }
}

/**
 * Encodes the given public key as a CID, using the multicodec code appropriate for the
 * given `keyType` (e.g. `ed25519-pub` for ed25519 keys). The key data is embedded into
 * the CID using the "identity" multihash codec (no hashing).
 *
 * @param {SupportedKeyType} keyType
 * @param {Uint8Array} publicKeyBytes
 * @returns {Promise<CID>}
 */
async function encodePublicKey (keyType, publicKeyBytes) {
  let keyCodec
  switch (keyType) {
    case 'ed25519':
      keyCodec = 0xed // defined in https://github.com/multiformats/multicodec/blob/master/table.csv#L94
      break
    default:
      throw new Error('Unsupported key type ' + keyType)
  }

  const digest = await identity.digest(publicKeyBytes)
  return CID.createV1(keyCodec, digest)
}

/**
 * Prepares a {@link WalletAuthenticationPayload} object for signing by serializing it to a dag-cbor block.
 *
 * @hidden
 * @param {WalletAuthenticationPayload} payload
 * @returns {Promise<EncodedWalletAuthenticationPayload>} an encoded dag-cbor representation of the payload, suitable for signing
 */
async function preparePayloadForSigning (payload) {
  const { cid, publicKey } = payload
  const value = { ...payload, cid: cid.bytes, publicKey: publicKey.bytes }
  const block = await Block.encode({ value, codec: dagCbor, hasher: sha256 })
  return block.bytes
}

/**
 * Creates, serializes and signs a {@link WalletAuthenticationPayload} and returns the encoded payload and the signature.
 *
 * Note that to verify the signature, you need to prefix the encoded payload with the DOMAIN_SIGNING_PREFIX before
 * verifying - the prefix is not attached to the returned payload.
 *
 * @hidden
 * @param {WalletAuthProvider} provider
 * @param {CIDString} cidString
 * @returns {Promise<{payload: EncodedWalletAuthenticationPayload, signature: WalletAuthenticationPayloadSignature}>}
 */
async function createAndSignWalletAuthPayload (provider, cidString) {
  const publicKey = await encodePublicKey(provider.keyType, provider.publicKey)
  const context = await provider.getChainContext()
  if (context.blockchain !== provider.blockchain) {
    throw new Error('chain context mismatch')
  }

  const cid = CID.parse(cidString)

  const payload = await preparePayloadForSigning({
    cid,
    publicKey,
    context
  })

  // We prefix the payload bytes with a domain separation tag to prevent reuse in other contexts
  const toSign = new Uint8Array([...SIGNING_DOMAIN_PREFIX, ...payload])
  const signature = await provider.signMessage(toSign)

  // return the unprefixed payload bytes & signature
  return { payload, signature }
}

export { Web3Storage, File, Blob, filesFromPath, getFilesFromPath }

/**
 * Just to verify API compatibility.
 * TODO: convert lib to a regular class that can be type checked.
 * @type {API}
 */
const api = Web3Storage
void api // eslint-disable-line no-void
