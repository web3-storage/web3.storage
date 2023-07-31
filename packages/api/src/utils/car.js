import { CarWriter } from '@ipld/car'
import { concat } from 'uint8arrays'
import * as Link from 'multiformats/link'
import { sha256 } from 'multiformats/hashes/sha2'
import { CAR_CODE } from '../constants.js'

/**
 * @param {import('multiformats').UnknownLink} root
 * @param {Array<{ cid: import('multiformats').UnknownLink, bytes: Uint8Array }>} blocks
 */
export async function encode (root, blocks) {
  // @ts-expect-error
  const { writer, out } = CarWriter.create(root)
  for (const b of blocks) {
    // @ts-expect-error incorrect CID type in @ipld/car
    writer.put(b)
  }
  writer.close()
  const chunks = []
  for await (const chunk of out) {
    chunks.push(chunk)
  }
  const bytes = concat(chunks)
  const digest = await sha256.digest(bytes)
  return { cid: Link.create(CAR_CODE, digest), bytes }
}
