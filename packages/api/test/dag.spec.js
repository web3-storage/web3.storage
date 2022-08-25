/* eslint-env mocha */
import assert from 'assert'
import { encode } from 'multiformats/block'
import * as pb from '@ipld/dag-pb'
import * as json from '@ipld/dag-json'
import { sha256 as hasher } from 'multiformats/hashes/sha2'
import { LinkIndexer } from '../src/utils/dag.js'
import { CID } from 'multiformats/cid'

describe('utils/dag.js', () => {
  it('should index dag-pb with no links', async () => {
    const block = await encode({ value: pb.prepare({ Links: [] }), codec: pb, hasher })
    const linkIndexer = new LinkIndexer()
    linkIndexer.decodeAndIndex({ cid: block.cid, bytes: block.bytes })
    assert.deepEqual(linkIndexer.links.get(block.cid.toString()), [])
    assert.equal(linkIndexer.links.size, 1)
    assert.equal(linkIndexer.isCompleteDag(), true)
    assert.equal(linkIndexer.getDagStructureLabel(), 'Complete')
  })

  it('should index dag-pb with links for complete dag', async () => {
    const child = await encode({ value: pb.prepare({ Links: [] }), codec: pb, hasher })
    const block = await encode({ value: pb.prepare({ Links: [child.cid] }), codec: pb, hasher }) 
    const linkIndexer = new LinkIndexer()

    linkIndexer.decodeAndIndex({ cid: block.cid, bytes: block.bytes })
    assert.equal(linkIndexer.isCompleteDag(), false)
    assert.equal(linkIndexer.getDagStructureLabel(), 'Partial')

    linkIndexer.decodeAndIndex({ cid: child.cid, bytes: child.bytes })
    assert.equal(linkIndexer.isCompleteDag(), true)
    assert.equal(linkIndexer.getDagStructureLabel(), 'Complete')

    assert.equal(linkIndexer.links.size, 2)
  })

  it('should index dag-json with no links', async () => {
    const block = await encode({ value: { foo: 'bar '}, codec: json, hasher })
    const linkIndexer = new LinkIndexer()
    linkIndexer.decodeAndIndex({ cid: block.cid, bytes: block.bytes })
    assert.deepEqual(linkIndexer.links.get(block.cid.toString()), [])
    assert.equal(linkIndexer.links.size, 1)
    assert.equal(linkIndexer.isCompleteDag(), true)
    assert.equal(linkIndexer.getDagStructureLabel(), 'Complete')
  })

  it('should index dag-json with links for complete dag', async () => {
    const child = await encode({ value: { foo: 'bar' }, codec: json, hasher })
    const block = await encode({ value: { child: child.cid }, codec: json, hasher }) 
    const linkIndexer = new LinkIndexer()

    linkIndexer.decodeAndIndex({ cid: block.cid, bytes: block.bytes })
    assert.equal(linkIndexer.isCompleteDag(), false)
    assert.equal(linkIndexer.getDagStructureLabel(), 'Partial')

    linkIndexer.decodeAndIndex({ cid: child.cid, bytes: child.bytes })
    assert.equal(linkIndexer.isCompleteDag(), true)
    assert.equal(linkIndexer.getDagStructureLabel(), 'Complete')

    assert.equal(linkIndexer.links.size, 2)
  })

  it('should handle unknown codecs', async () => {
    const block = await encode({ value: { foo: 'bar '}, codec: json, hasher })
    const linkIndexer = new LinkIndexer()
    // simulate not having a codec
    const codecs = []
    linkIndexer.decodeAndIndex({ cid: block.cid, bytes: block.bytes }, { codecs }) 
    assert.equal(linkIndexer.getDagStructureLabel(), 'Unknown')
    assert.throws(() => linkIndexer.isCompleteDag())
  })
})
