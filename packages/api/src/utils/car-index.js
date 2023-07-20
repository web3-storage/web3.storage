/* global TransformStream, WritableStream */
import * as Link from 'multiformats/link'
import { sha256 } from 'multiformats/hashes/sha2'
import { concat } from 'uint8arrays'
import { MultihashIndexSortedWriter } from 'cardex/multihash-index-sorted'

/**
 * @param {Iterable<[import('multiformats').UnknownLink, number]>} items
 */
export const encode = async items => {
  const { writable, readable } = new TransformStream()
  const writer = MultihashIndexSortedWriter.createWriter({ writer: writable.getWriter() })
  for (const [cid, offset] of items) {
    writer.add(cid, offset)
  }
  writer.close()

  const chunks = []
  await readable.pipeTo(new WritableStream({ write: chunk => { chunks.push(chunk) } }))

  const bytes = concat(chunks)
  const digest = await sha256.digest(bytes)
  return { cid: Link.create(MultihashIndexSortedWriter.codec, digest), bytes }
}
