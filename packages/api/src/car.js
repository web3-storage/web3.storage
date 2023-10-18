// @ts-nocheck
/* eslint-env serviceworker */
/* global ReadableStream */
import { PutObjectCommand } from '@aws-sdk/client-s3/dist-es/commands/PutObjectCommand.js'
import { toString } from 'uint8arrays'
import { LinkIndexer } from 'linkdex'
import { maybeDecode } from 'linkdex/decode'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as raw from 'multiformats/codecs/raw'
import * as pb from '@ipld/dag-pb'
import { validateBlock } from '@web3-storage/car-block-validator'
import pRetry from 'p-retry'
import { CARReaderStream } from 'carstream'
import { Map as LinkMap } from 'lnmap'
import { Set as LinkSet } from 'lnset'
import * as CAR from './utils/car.js'
import * as CARIndex from './utils/car-index.js'
import { InvalidCarError, LinkdexError } from './errors.js'
import { MAX_BLOCK_SIZE, CAR_CODE } from './constants.js'
import { JSONResponse } from './utils/json-response.js'
import { getPins, PIN_OK_STATUS, waitAndUpdateOkPins } from './utils/pin.js'
import { normalizeCid } from './utils/cid.js'
import { bucketKeyToCarCID } from './utils/bucket.js'

/**
 * @typedef {import('multiformats/cid').CID} CID
 */

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

  for (const url of env.gatewayUrls) {
    res = await fetch(new URL(`/ipfs/${encodeURIComponent(cid)}?format=car`, url))
    if (res.ok) break
  }
  if (!res.ok) {
    // bail early. dont cache errors.
    return res
  }
  // Clone the response so that it's no longer immutable. Ditch the original headers.
  // Note: keeping the original headers seems to prevent the carHead function from setting Content-Length
  res = new Response(res.body)
  res.headers.set('Content-Type', 'application/vnd.ipld.car')
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
  const blob = await request.blob()
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

  // load the car into memory just the once here
  const carBytes = new Uint8Array(await car.arrayBuffer())

  // Throws if CAR is invalid by our standards.
  // Returns either the sum of the block sizes in the CAR, or the cumulative size of the DAG for a dag-pb root.
  const { size: dagSize, rootCid, carCid, structure, linkIndex, blockOffsets } = await carStat(carBytes)

  const sourceCid = rootCid.toString()
  const contentCid = normalizeCid(sourceCid)
  const s3Key = `raw/${sourceCid}/${user._id}/${toString(carCid.multihash.bytes, 'base32')}.car`
  const r2Key = `${carCid}/${carCid}.car`
  env.sentry?.setExtras({ sourceCid, carCid: carCid.toString(), dagSize, structure, s3Key, r2Key })

  await Promise.all([
    putToS3(env, s3Key, carBytes, carCid, sourceCid, structure),
    putToR2(env, r2Key, carBytes, carCid, sourceCid, structure),
    (async () => {
      const { cid: indexCid, carCid: indexCarCid } = await writeSatNavIndex(env, carCid, blockOffsets)
      await writeContentClaims(env, rootCid, carCid, indexCid, indexCarCid, structure, linkIndex)
    })(),
    writeDudeWhereIndex(env, contentCid, carCid)
  ])

  const xName = headers.get('x-name')
  let name = xName && decodeURIComponent(xName)
  if (!name || typeof name !== 'string') {
    name = `Upload at ${new Date().toISOString()}`
  }

  // provide a pin object for elastic-ipfs.
  const elasticPin = (structure) => ({
    status: structure === 'Complete' ? 'Pinned' : 'Pinning',
    contentCid,
    location: {
      peerName: 'elastic-ipfs',
      // there isn't a seperate cluster peer for e-ipfs, so we reuse the ipfs peer.
      peerId: env.ELASTIC_IPFS_PEER_ID,
      ipfsPeerId: env.ELASTIC_IPFS_PEER_ID
    }
  })

  await env.db.createUpload({
    user: user._id,
    authKey: authToken?._id,
    contentCid,
    sourceCid,
    name,
    type: uploadType,
    backupUrls: [
      `https://${env.s3BucketName}.s3.${env.s3BucketRegion}.amazonaws.com/${s3Key}`,
      new URL(r2Key, env.CARPARK_URL).toString()
    ],
    pins: [elasticPin(structure)],
    dagSize
  })

  /** @type {(() => Promise<any>)[]} */
  const tasks = []

  // ask linkdex for the dag structure across the set of CARs in S3 for this upload.
  const checkDagStructureTask = async () => {
    /** @type {import('linkdex').Report & { cars: string[] }} */
    const report = await pRetry(async () => {
      const url = new URL(`/?key=${s3Key}`, env.LINKDEX_URL)
      const res = await fetch(url)
      if (!res.ok) {
        throw new LinkdexError(res.status, res.statusText)
      }
      return await res.json()
    }, { retries: 3 })

    if (report.structure === 'Complete') {
      return Promise.all([
        pRetry(() => env.db.upsertPins([elasticPin(report.structure)]), { retries: 3 }),
        pRetry(async () => {
          const { claimFactory } = env
          if (!claimFactory) return
          const parts = new LinkSet(report.cars.map(bucketKeyToCarCID).filter(Boolean))
          const claim = claimFactory.createPartitionClaim(rootCid, [...parts])
          const result = await claim.execute(claimFactory.connection)
          if (!result.ok) {
            throw new Error('failed writing partition claim', { cause: result.out.error })
          }
        }, { retries: 3 })
      ])
    }
  }

  // pin and add the blocks to cluster. Has it's own internal retry logic.
  const addToClusterTask = async () => {
    try {
      await pinToCluster(sourceCid, env)
    } catch (err) {
      console.warn('failed to pin to cluster', err)
    }

    const pins = await addToCluster(car, env)

    await env.db.upsertPins(pins.map(p => ({
      status: p.status,
      contentCid,
      location: p.location
    })))

    // Retrieve current pin status and info about the nodes pinning the content.
    // Keep querying Cluster until one of the nodes reports something other than
    // Unpinned i.e. PinQueued or Pinning or Pinned.
    if (!pins.some(p => PIN_OK_STATUS.includes(p.status))) {
      await waitAndUpdateOkPins(contentCid, env.cluster, env.db)
    }
  }

  // no need to ask linkdex if it's Complete or Unknown
  if (structure === 'Partial' && env.LINKDEX_URL) {
    tasks.push(checkDagStructureTask)
  }

  if (env.ENABLE_ADD_TO_CLUSTER === 'true') {
    tasks.push(addToClusterTask)
  }

  if (ctx.waitUntil) {
    tasks.forEach(t => ctx.waitUntil(t()))
  }

  return new JSONResponse({ cid: sourceCid, carCid: carCid.toString() })
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
 * Adds car to local cluster and returns its pins.
 *
 * @param {Blob} car
 * @param {import('./env').Env} env
 */
async function addToCluster (car, env) {
  // Note: We can't make use of `bytes` or `size` properties on the response from cluster.add
  // `bytes` is the sum of block sizes in bytes. Where the CAR is a partial, it'll only be a shard of the total dag size.
  // `size` is UnixFS FileSize which is 0 for directories, and is not set for raw encoded files, only dag-pb ones.
  const { cid } = await env.cluster.addCAR(car, {
    metadata: { size: car.size.toString() },
    local: false
  })

  return getPins(cid, env.cluster)
}

/**
 * Pins a CID to Cluster and returns its pins.
 *
 * @param {string} cid
 * @param {import('./env').Env} env
 */
async function pinToCluster (cid, env) {
  await env.cluster.pin(cid)
  return getPins(cid, env.cluster)
}

/**
 * DAG structure metadata
 * "Unknown" structure means it could be a partial or it could be a complete DAG
 * i.e. we haven't walked the graph to verify if we have all the blocks or not.
 */

/**
 * Upload given CAR file to S3
 *
 * @param {import('./env').Env} env
 * @param {string} key
 * @param {Uint8Array} carBytes
 * @param {CID} carCid
 * @param {string} rootCid
 * @param {import('linkdex').DagStructure} structure The known structural completeness of a given DAG.
 */
async function putToS3 (env, key, carBytes, carCid, rootCid, structure = 'Unknown') {
  env.log.time('putToS3')
  // aws doesn't understand multihashes yet, so we given them the unprefixed sha256 digest.
  // aws will compute the sha256 of the bytes they receive, and the put fails if they don't match.
  // see: https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html#AmazonS3-PutObject-request-header-ChecksumSHA256
  const carSha256 = toString(carCid.multihash.digest, 'base64pad')

  /** @type import('@aws-sdk/client-s3').PutObjectCommandInput */
  const cmdParams = {
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    Body: carBytes,
    Metadata: {
      structure,
      rootCid,
      carCid: carCid.toString()
    },
    ChecksumSHA256: carSha256
  }
  try {
    return await pRetry(() => env.s3Client.send(new PutObjectCommand(cmdParams)), { retries: 3 })
  } catch (cause) {
    throw new Error('Failed to upload CAR to S3', { cause })
  } finally {
    env.log.timeEnd('putToS3')
  }
}

/**
 * Upload a CAR to R2.
 * Send the md5 along so Cloudflare can verify the integrity of the bytes.
 * Only md5 supported at this time.
 *
 * see: https://developers.cloudflare.com/r2/platform/s3-compatibility/api/#implemented-object-level-operations
 *
 * @param {import('./env').Env} env
 * @param {string} key
 * @param {Uint8Array} carBytes
 * @param {CID} carCid
 * @param {string} rootCid
 * @param {import('linkdex').DagStructure} structure
 */
export async function putToR2 (env, key, carBytes, carCid, rootCid, structure = 'Unknown') {
  env.log.time('putToR2')
  /** @type R2PutOptions */
  const opts = {
    sha256: toString(carCid.multihash.digest, 'base16'), // put fails if hash not match
    customMetadata: {
      structure,
      rootCid,
      carCid: carCid.toString()
    }
  }
  try {
    // assuming mostly unique cars, but could check for existence here before writing.
    return await pRetry(async () => env.CARPARK.put(key, carBytes, opts), { retries: 3 })
  } catch (cause) {
    throw new Error(`Failed to upload CAR to R2: ${key}`, { cause })
  } finally {
    env.log.timeEnd('putToR2')
  }
}

/**
 * Write a CARv2 index for the passed CAR file to R2.
 *
 * @param {import('./env').Env} env
 * @param {CID} carCid
 * @param {Map<CID, number>} blockOffsets
 */
export async function writeSatNavIndex (env, carCid, blockOffsets) {
  env.log.time('writeSatNavIndex')
  const index = await CARIndex.encode(blockOffsets)
  const indexKey = `${carCid}/${carCid}.car.idx`

  // Store the index in CARPARK so it can be fetched like any other DAG
  const car = await CAR.encode(index.cid, [index])
  const carKey = `${car.cid}/${car.cid}.car`

  /** @type R2PutOptions */
  const satnavOpts = { sha256: toString(index.cid.multihash.digest, 'base16') }
  /** @type R2PutOptions */
  const carparkOpts = { sha256: toString(car.cid.multihash.digest, 'base16') }
  try {
    // assuming mostly unique cars, but could check for existence here before writing.
    await Promise.all([
      pRetry(async () => env.SATNAV.put(indexKey, index.bytes, satnavOpts), { retries: 3 }),
      pRetry(async () => env.CARPARK.put(carKey, car.bytes, carparkOpts), { retries: 3 })
    ])
    return { cid: index.cid, carCid: car.cid }
  } catch (cause) {
    throw new Error(`Failed to write satnav index to R2: ${indexKey}`, { cause })
  } finally {
    env.log.timeEnd('writeSatNavIndex')
  }
}

/**
 * Write a mapping of root data CID => CAR CID to R2.
 *
 * @param {import('./env').Env} env
 * @param {string} rootCid
 * @param {CID} carCid
 */
export async function writeDudeWhereIndex (env, rootCid, carCid) {
  env.log.time('writeDudeWhereIndex')
  const key = `${rootCid}/${carCid}`
  const data = new Uint8Array()

  try {
    return await pRetry(async () => env.DUDEWHERE.put(key, data), { retries: 3 })
  } catch (cause) {
    throw new Error(`Failed to write dudewhere index to R2: ${key}`, { cause })
  } finally {
    env.log.timeEnd('writeDudeWhereIndex')
  }
}

/**
 * @param {import('./env').Env} env
 * @param {import('multiformats').UnknownLink} rootCid
 * @param {import('multiformats').Link} carCid
 * @param {import('multiformats').Link} indexCid
 * @param {import('multiformats').Link} indexCarCid
 * @param {import('linkdex').DagStructure} structure
 * @param {Map<import('multiformats').UnknownLink, Set<import('multiformats').UnknownLink>>} linkIndex
 */
async function writeContentClaims (env, rootCid, carCid, indexCid, indexCarCid, structure, linkIndex) {
  const { claimFactory } = env
  if (!claimFactory) return
  env.log.time('writeContentClaims')
  try {
    const claims = [
      // The uploaded CAR includes the CIDs in the index.
      claimFactory.createInclusionClaim(carCid, indexCid),
      // The index data can be found in the index CAR.
      claimFactory.createPartitionClaim(indexCid, [indexCarCid]),
      // Blocks with links have children that can be found in this CAR.
      ...claimFactory.createRelationClaims(rootCid, carCid, indexCid, indexCarCid, linkIndex),
      // If complete DAG, it can be found in the uploaded CAR.
      ...(structure === 'Complete' ? [claimFactory.createPartitionClaim(rootCid, [carCid])] : [])
    ]
    const results = await pRetry(() => claimFactory.connection.execute(...claims), { retries: 3 })
    for (const result of results) {
      if (result.out.ok) continue
      throw new Error('failed writing content claims', { cause: result.out.error.message })
    }
  } finally {
    env.log.timeEnd('writeContentClaims')
  }
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
 * @typedef {{
 *   size: number
 *   blocks: number
 *   rootCid: CID
 *   carCid: CID
 *   structure: import('linkdex').DagStructure
 *   linkIndex: Map<import('multiformats').UnknownLink, Set<import('multiformats').UnknownLink>>
 *   blockOffsets: Map<import('multiformats').UnknownLink, number>
 * }} CarStat
 * @param {Uint8Array} carBytes
 * @returns {Promise<CarStat>}
 */
async function carStat (carBytes) {
  const carCid = CID.createV1(CAR_CODE, await sha256.digest(carBytes))
  const carByteStream = new ReadableStream({
    pull (controller) {
      controller.enqueue(carBytes)
      controller.close()
    }
  })
  const carReader = new CARReaderStream()
  const blocksIterator = toIterable(carByteStream.pipeThrough(carReader))
  const { roots } = await carReader.getHeader()
  if (roots.length === 0) {
    throw new InvalidCarError('missing roots')
  }
  if (roots.length > 1) {
    throw new InvalidCarError('too many roots')
  }
  const linkIndexer = new LinkIndexer()
  const rootCid = roots[0]
  let rawRootBlock
  /** @type {Map<import('multiformats').Link, number>} */
  const blockOffsets = new LinkMap()
  let blocks = 0
  for await (const block of blocksIterator) {
    const blockSize = block.bytes.byteLength
    if (blockSize > MAX_BLOCK_SIZE) {
      throw new InvalidCarError(`block too big: ${blockSize} > ${MAX_BLOCK_SIZE}`)
    }
    await validateBlock(block)
    if (!rawRootBlock && block.cid.equals(rootCid)) {
      rawRootBlock = block
    }
    linkIndexer.decodeAndIndex(block)
    blockOffsets.set(block.cid, block.offset)
    blocks++
  }
  if (blocks === 0) {
    throw new InvalidCarError('empty CAR')
  }
  if (!rawRootBlock) {
    throw new InvalidCarError('missing root block')
  }
  let size
  // if there's only 1 block (the root block) and it's a raw node, we know the size.
  if (blocks === 1 && rootCid.code === raw.code) {
    size = rawRootBlock.bytes.byteLength
  } else {
    const rootBlock = maybeDecode(rawRootBlock)
    if (rootBlock) {
      const hasLinks = !rootBlock.links()[Symbol.iterator]().next().done
      // if the root block has links, then we should have at least 2 blocks in the CAR
      if (hasLinks && blocks < 2) {
        throw new InvalidCarError('CAR must contain at least one non-root block')
      }
      // get the size of the full dag for this root, even if we only have a partial CAR.
      if (rootBlock.cid.code === pb.code) {
        size = cumulativeSize(rootBlock.bytes, rootBlock.value)
      }
    }
  }
  const structure = linkIndexer.getDagStructureLabel()
  return { size, blocks, rootCid, carCid, structure, linkIndex: linkIndexer.idx, blockOffsets }
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
 * ReadableStream does not have [Symbol.asyncIterator] in typescript types yet.
 * @template T
 * @param {ReadableStream<T>} readable
 * @returns {AsyncIterable<T>}
 */
const toIterable = readable => readable
