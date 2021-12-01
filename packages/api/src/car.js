/* eslint-env serviceworker */
import { PutObjectCommand } from '@aws-sdk/client-s3/dist-es/commands/PutObjectCommand.js'
import { CarBlockIterator } from '@ipld/car'
import { toString } from 'uint8arrays'
import { Block } from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'
import * as raw from 'multiformats/codecs/raw'
import * as cbor from '@ipld/dag-cbor'
import * as pb from '@ipld/dag-pb'
import retry from 'p-retry'
import { GATEWAY, LOCAL_ADD_THRESHOLD, MAX_BLOCK_SIZE } from './constants.js'
import { JSONResponse } from './utils/json-response.js'
import { toPinStatusEnum } from './utils/pin.js'
import { normalizeCid } from './utils/normalize-cid.js'

/**
 * @typedef {import('multiformats/cid').CID} CID
 */

const decoders = [pb, raw, cbor]

// Duration between status check polls in ms.
const PIN_STATUS_CHECK_INTERVAL = 5000
// Max time in ms to spend polling for an OK status.
const MAX_PIN_STATUS_CHECK_TIME = 30000
// Pin statuses considered OK.
const PIN_OK_STATUS = ['Pinned', 'Pinning', 'PinQueued']
// Times to retry the transaction after the first failure.
const CREATE_UPLOAD_RETRIES = 4
// Time in ms before starting the first retry.
const CREATE_UPLOAD_MAX_TIMEOUT = 100

/**
 * TODO: ipfs should let us ask the size of a CAR file.
 * This consumes the CAR response from ipfs to find the content-length.
 *
 * @param {Request} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function carHead (request, env, ctx) {
  // cache the thing. can't cache a HEAD request, so make a new one.
  const get = new Request(request.url, { method: 'GET' })
  // add the router params
  get.params = request.params
  const res = await carGet(get, env, ctx)
  const size = await sizeOf(res)
  const headers = new Headers(res.headers)
  headers.set('Content-Length', size)
  // skip the body, it's a HEAD.
  return new Response(null, { headers })
}

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function carGet (request, env, ctx) {
  const cache = caches.default
  let res = await cache.match(request)

  if (res) {
    return res
  }

  const {
    params: { cid }
  } = request
  // gateway does not support `carversion` yet.
  // using it now means we can skip the cache if it is supported in the future
  const url = new URL(`/api/v0/dag/export?arg=${cid}&carversion=1`, GATEWAY)
  res = await fetch(url, { method: 'POST' })
  if (!res.ok) {
    // bail early. dont cache errors.
    return res
  }
  // Clone the response so that it's no longer immutable. Ditch the original headers.
  // Note: keeping the original headers seems to prevent the carHead function from setting Content-Length
  res = new Response(res.body)
  res.headers.set('Content-Type', 'application/car')
  // cache for 1 year, the max max-age value.
  res.headers.set('Cache-Control', 'public, max-age=31536000')
  // without the content-disposition, firefox describes them as DMS files.
  res.headers.set('Content-Disposition', `attachment; filename="${cid}.car"`)
  // always https pls.
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload"')
  // // compress if asked for? is it worth it?
  // if (request.headers.get('Accept-Encoding').match('gzip')) {
  //   headers['Content-Encoding'] = 'gzip'
  // }
  ctx.waitUntil(cache.put(request, res.clone()))
  return res
}

/**
 * Post a CAR file.
 *
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function carPost (request, env, ctx) {
  let blob = await request.blob()
  // Ensure car blob.type is set; it is used by the cluster client to set the format=car flag on the /add call.
  blob = blob.slice(0, blob.size, 'application/car')

  return handleCarUpload(request, env, ctx, blob)
}

/**
 * Request handler for a CAR file upload.
 *
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 * @param {Blob} car
 * @param {string} [uploadType = 'Car']
 */
export async function handleCarUpload (request, env, ctx, car, uploadType = 'Car') {
  const { user, authToken } = request.auth
  const { headers } = request

  // Throws if CAR is invalid by our standards.
  // Returns either the sum of the block sizes in the CAR, or the cumulative size of the DAG for a dag-pb root.
  const { size: dagSize, rootCid } = await carStat(car)

  const [{ cid, pins }, backupKey] = await Promise.all([
    addToCluster(car, env),
    backup(car, rootCid, user._id, env)
  ])

  const xName = headers.get('x-name')
  let name = xName && decodeURIComponent(xName)
  if (!name || typeof name !== 'string') {
    name = `Upload at ${new Date().toISOString()}`
  }

  const normalizedCid = normalizeCid(cid)
  // Store in DB
  // Retried because it's possible to receive the error:
  // "Transaction was aborted due to detection of concurrent modification."
  await retry(() => (
    env.db.createUpload({
      user: user._id,
      authKey: authToken?._id,
      contentCid: normalizedCid,
      sourceCid: cid,
      name,
      type: uploadType,
      backupUrls: backupKey
        ? [`https://${env.s3BucketName}.s3.${env.s3BucketRegion}.amazonaws.com/${backupKey}`]
        : [],
      pins,
      dagSize
    })
  ), {
    retries: CREATE_UPLOAD_RETRIES,
    minTimeout: CREATE_UPLOAD_MAX_TIMEOUT
  })

  /** @type {(() => Promise<any>)[]} */
  const tasks = []

  // Retrieve current pin status and info about the nodes pinning the content.
  // Keep querying Cluster until one of the nodes reports something other than
  // Unpinned i.e. PinQueued or Pinning or Pinned.
  if (!pins.some(p => PIN_OK_STATUS.includes(p.status))) {
    tasks.push(async () => {
      const start = Date.now()
      while (Date.now() - start > MAX_PIN_STATUS_CHECK_TIME) {
        await new Promise(resolve => setTimeout(resolve, PIN_STATUS_CHECK_INTERVAL))
        const { peerMap } = await env.cluster.status(cid)
        const pins = toPins(peerMap)
        if (!pins.length) { // should not happen
          throw new Error('not pinning on any node')
        }

        const okPins = pins.filter(p => PIN_OK_STATUS.includes(p.status))
        if (!okPins.length) continue

        for (const pin of okPins) {
          await env.db.upsertPin(normalizedCid, pin)
        }
        return
      }
    })
  }

  if (ctx.waitUntil) {
    tasks.forEach(t => ctx.waitUntil(t()))
  }

  return new JSONResponse({ cid })
}

export async function carPut (request, env, ctx) {
  return new Response(`${request.method} /car no can has`, { status: 501 })
}

export async function sizeOf (response) {
  const reader = response.body.getReader()
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    // this should be ok up to about 9 Petabytes.
    // Number.MAX_SAFE_INTEGER = 9,007,199,254,740,991
    size += value.byteLength
  }
  return size
}

/**
 * Adds car to local cluster and returns its content identifier and pins
 *
 * @param {Blob} car
 * @param {import('./env').Env} env
 */
async function addToCluster (car, env) {
  // Note: We can't make use of `bytes` or `size` properties on the response from cluster.add
  // `bytes` is the sum of block sizes in bytes. Where the CAR is a partial, it'll only be a shard of the total dag size.
  // `size` is UnixFS FileSize which is 0 for directories, and is not set for raw encoded files, only dag-pb ones.
  const { cid } = await env.cluster.add(car, {
    metadata: { size: car.size.toString() },
    // When >2.5MB, use local add, because waiting for blocks to be sent to
    // other cluster nodes can take a long time. Replication to other nodes
    // will be done async by bitswap instead.
    local: car.size > LOCAL_ADD_THRESHOLD
  })

  const { peerMap } = await env.cluster.status(cid)
  const pins = toPins(peerMap)
  if (!pins.length) { // should not happen
    throw new Error('not pinning on any node')
  }

  return { cid, pins }
}

/**
 * Backup given Car file keyed by /raw/${rootCid}/${userId}/${carHash}.car
 * @param {Blob} blob
 * @param {CID} rootCid
 * @param {string} userId
 * @param {import('../env').Env} env
 */
async function backup (blob, rootCid, userId, env) {
  if (!env.s3Client) {
    return undefined
  }

  const data = await blob.arrayBuffer()
  const dataHash = await sha256.digest(new Uint8Array(data))
  const keyStr = `raw/${rootCid.toString()}/${userId}/${toString(dataHash.bytes, 'base32')}.car`
  const cmdParams = {
    Bucket: env.s3BucketName,
    Key: keyStr,
    Body: blob
  }

  await env.s3Client.send(new PutObjectCommand(cmdParams))
  return keyStr
}

/**
 * Returns the sum of all block sizes and total blocks. Throws if the CAR does
 * not conform to our idea of a valid CAR i.e.
 * - Missing root CIDs
 * - >1 root CID
 * - Any block bigger than MAX_BLOCK_SIZE (1MiB)
 * - 0 blocks
 * - Missing root block
 * - Missing non-root blocks (when root block has links)
 *
 * @typedef {{ size: number, blocks: number, rootCid: CID }} CarStat
 * @param {Blob} carBlob
 * @returns {Promise<CarStat>}
 */
async function carStat (carBlob) {
  const carBytes = new Uint8Array(await carBlob.arrayBuffer())
  const blocksIterator = await CarBlockIterator.fromBytes(carBytes)
  const roots = await blocksIterator.getRoots()
  if (roots.length === 0) {
    throw new Error('missing roots')
  }
  if (roots.length > 1) {
    throw new Error('too many roots')
  }
  const rootCid = roots[0]
  let rawRootBlock
  let blocks = 0
  let size = 0
  for await (const block of blocksIterator) {
    const blockSize = block.bytes.byteLength
    if (blockSize > MAX_BLOCK_SIZE) {
      throw new Error(`block too big: ${blockSize} > ${MAX_BLOCK_SIZE}`)
    }
    if (!rawRootBlock && block.cid.equals(rootCid)) {
      rawRootBlock = block
    }
    size += blockSize
    blocks++
  }
  if (blocks === 0) {
    throw new Error('empty CAR')
  }
  if (!rawRootBlock) {
    throw new Error('missing root block')
  }
  const decoder = decoders.find(d => d.code === rootCid.code)
  if (decoder) {
    const rootBlock = new Block({ cid: rootCid, bytes: rawRootBlock.bytes, value: decoder.decode(rawRootBlock.bytes) })
    const links = Array.from(rootBlock.links())
    // if the root block has links, then we should have at least 2 blocks in the CAR
    if (blocks === 1 && links.length > 0) {
      throw new Error('CAR must contain at least one non-root block')
    }
    // get the size of the full dag for this root, even if we only have a partial CAR.
    if (rootBlock.cid.code === pb.code) {
      size = cumulativeSize(rootBlock.bytes, rootBlock.value)
    }
  }
  return { size, blocks, rootCid }
}

/**
 * The sum of the node size and size of each link
 * @param {Uint8Array} pbNodeBytes
 * @param {import('@ipld/dag-pb/src/interface').PBNode} pbNode
 * @returns {number} the size of the DAG in bytes
 */
function cumulativeSize (pbNodeBytes, pbNode) {
  // NOTE: Tsize is optional, but all ipfs implementations we know of set it.
  // It's metadata, that could be missing or deliberately set to an incorrect value.
  // This logic is the same as used by go/js-ipfs to display the cumulative size of a dag-pb dag.
  return pbNodeBytes.byteLength + pbNode.Links.reduce((acc, curr) => acc + (curr.Tsize || 0), 0)
}

/**
 * @param {import('@nftstorage/ipfs-cluster').StatusResponse['peerMap']} peerMap
 */
function toPins (peerMap) {
  return Object.entries(peerMap).map(([peerId, { peerName, status }]) => ({
    status: toPinStatusEnum(status),
    location: { peerId, peerName }
  }))
}
