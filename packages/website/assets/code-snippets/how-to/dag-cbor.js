// #region imports
import { Web3Storage } from 'web3.storage'
import { CarReader } from '@ipld/car'
import { encode } from 'multiformats/block'
import * as cbor from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
// #endregion cborLinkExample

// #region makeUnixFsFile
import { importer } from 'ipfs-unixfs-importer'
import { MemoryBlockStore } from 'ipfs-car/blockstore/memory'
// #endregion imports

// #region encodeCborBlock
async function encodeCborBlock (value) {
  return encode({ value, codec: cbor, hasher: sha256 })
}
// #endregion encodeCborBlock

// #region makeCar
async function makeCar (rootCID, ipldBlocks) {
  return new CarReader(1, [rootCID], ipldBlocks)
}
// #endregion makeCar

// #region simpleCborExample
async function simpleCborExample () {
  // encode the value into an IPLD block and store with web3.storage
  const block = await encodeCborBlock({ hello: 'world' })
  const car = await makeCar(block.cid, [block])

  // upload to web3.storage using putCar
  const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN })
  console.log('🤖 Storing simple CBOR object...')
  const cid = await client.putCar(car)
  console.log(`🎉 Done storing simple CBOR object. CID: ${cid}`)
  console.log(`💡 If you have ipfs installed, try: ipfs dag get ${cid}\n`)
}
// #endregion simpleCborExample

// #region cborLinkExample
async function cborLinkExample () {
  // Encode a simple object to get its CID
  const addressBlock = await encodeCborBlock({ email: 'zaphod@beeblebrox.galaxy' })

  // Now we can use the CID to link to the object from another object
  const personBlock = await encodeCborBlock({
    title: 'Galactic President',
    description: 'Just this guy, you know?',
    contact: addressBlock.cid
  })

  // pack everything into a CAR
  const car = await makeCar(personBlock.cid, [personBlock, addressBlock])

  // upload to web3.storage using putCar
  const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN })

  console.log('🤖 Storing CBOR objects with CID links between them...')
  const cid = await client.putCar(car)
  console.log('🎉 Stored linked data using dag-cbor. Root CID:', cid)
  console.log(`💡 If you have ipfs installed, try: ipfs dag get ${cid}`)
  console.log(`🔗 You can also traverse the link by path: ipfs dag get ${cid}/contact\n`)
}
async function makeUnixFsFile (source) {
  const blockstore = new MemoryBlockStore()
  // taken from https://github.com/web3-storage/ipfs-car/blob/main/src/pack/constants.ts
  // but with wrapWithDirectory overriden to false
  const unixFsOptions = {
    cidVersion: 1,
    chunker: 'fixed',
    maxChunkSize: 262144,
    hasher: sha256,
    rawLeaves: true,
    wrapWithDirectory: false,
    maxChildrenPerNode: 174
  }
  const importStream = await importer(source, blockstore, unixFsOptions)
  let root = null
  for await (const entry of importStream) {
    root = entry
  }
  const blocks = []
  for await (const block of blockstore.blocks()) {
    blocks.push(block)
  }
  await blockstore.close()
  return { root, blocks }
}
// #endregion makeUnixFsFile

// #region cborLinkToFileExample
async function cborLinkToFileExample () {
  const source = [{
    path: 'example.txt',
    content: new TextEncoder().encode('Some plain text, encoded to UTF-8')
  }]
  const { root, blocks } = await makeUnixFsFile(source)
  const cborBlock = await encodeCborBlock({
    description: 'A CBOR object that references a UnixFS file object by CID',
    file: root.cid
  })

  blocks.push(cborBlock)
  const car = await makeCar(cborBlock.cid, blocks)

  const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN })
  console.log('🤖 Storing a CBOR object that links to a UnixFS file by CID...')
  const cid = await client.putCar(car)
  console.log('🎉 Stored dag-cbor object that links to a unixfs file. Root CID: ', cid)
  console.log(`💡 If you have ipfs installed, try: ipfs dag get ${cid}`)
  console.log(`💾 You can view the linked file with ipfs: ipfs cat ${cid}/file`)
  console.log('🔗 View linked file via IPFS gateway: ', `https://${cid}.ipfs.dweb.link/file`)
}
// #endregion cborLinkToFileExample

simpleCborExample()
  .then(cborLinkExample)
  .then(cborLinkToFileExample)
  .catch(console.error)
