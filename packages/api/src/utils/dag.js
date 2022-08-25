import * as Block from 'multiformats/block'
import * as raw from 'multiformats/codecs/raw'
import * as json from '@ipld/dag-json'
import * as cbor from '@ipld/dag-cbor'
import * as pb from '@ipld/dag-pb'

const decoders = {
  [raw.code]: raw,
  [pb.code]: pb,
  [cbor.code]: cbor,
  [json.code]: json
}

/**
 * Decode a CAR Block (bytes) into a multiformats Block.
 * Decoding allows us to find out if that block links to any others by CID.
 * @param {import('@ipld/car/api').Block} block
 * @param {object} [opts]
 * @param {object} [opts.codecs]
 * @returns {Block.Block | undefined}
 */
export function maybeDecode ({ cid, bytes }, { codecs = decoders } = {}) {
  const codec = codecs[cid.code]
  if (codec) {
    return Block.createUnsafe({ cid, bytes, codec })
  }
}

/**
 * A util to record all the links from a given set of Blocks.
 * Pass blocks to `decodeAndIndex` as you iterate over a CAR.
 * Then call `getDagStructureLabel` to find out if the dag is
 * complete... if all linked to CIDs are also contained in in
 * the set, then it is complete.
 */
export class LinkIndexer {
  constructor () {
    this.links = new Map()
    this.anyUndecodable = false
  }

  /**
   * Decode the block and index any CIDs it links to
   * @param {import('@ipld/car/api').Block} block
   * @param {object} [opts]
   * @param {object} [opts.codecs]
   */
  decodeAndIndex ({ cid, bytes }, opts) {
    const block = maybeDecode({ cid, bytes }, opts)
    if (!block) {
      this.anyUndecodable = true
    } else {
      this.index(block)
    }
  }

  /**
   * Index all the links from the block
   * @param {Block.Block} block
   */
  index (block) {
    const key = block.cid.toString()
    if (this.links.has(key)) {
      return // already indexed this block
    }
    const targets = []
    for (const [, targetCid] of block.links()) {
      targets.push(targetCid.toString())
    }
    this.links.set(key, targets)
  }

  /**
   * Find out if any of the links point to a CID that isn't in the CAR
   * @returns {boolean}
   */
  isCompleteDag () {
    if (this.anyUndecodable) {
      throw new Error('DAG completeness unknown! Some blocks failed to decode')
    }
    if (this.links.size === 0) {
      throw new Error('No blocks were indexed.')
    }
    for (const targets of this.links.values()) {
      // if there is any target cid that isn't also a source cid, it's incomplete.
      if (targets.some(t => !this.links.has(t))) {
        return false
      }
    }
    return true
  }

  /**
   * Provide a value for the `structure` metadata for the CAR.
   * @returns { 'Complete' | 'Partial' | 'Unknown' }
   */
  getDagStructureLabel () {
    if (this.anyUndecodable) {
      return 'Unknown'
    }
    if (this.isCompleteDag()) {
      return 'Complete'
    }
    return 'Partial'
  }
}
