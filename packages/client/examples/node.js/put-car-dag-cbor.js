import process from 'process'
import minimist from 'minimist'
import { CarReader } from '@ipld/car'
import { encode } from 'multiformats/block'
import * as cbor from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { Web3Storage } from 'web3.storage'

// This file has a few examples of uploading structured IPLD data to Web3.Storage
// by creating a Content Archive (CAR) and using the putCar client method.
//
// See https://docs.web3.storage/how-tos/work-with-car-files/#advanced-ipld-formats
// for more information.

async function main () {
  const args = minimist(process.argv.slice(2))
  const token = args.token

  if (!token) {
    console.error('A token is needed. You can create one on https://web3.storage')
    return
  }

  const storage = new Web3Storage({ token })
  await simpleCborExample(storage)
  await cborLinkExample(storage)
}

main()

/**
 * Stores a simple "hello world" object as IPLD data, encoded using dag-cbor.
 * @param {Web3.Storage} storage a Web3.Storage client
 */
async function simpleCborExample (storage) {
  // encode the value into an IPLD block and store with Web3.Storage
  const block = await encodeCborBlock({ hello: 'world' })
  const car = await makeCar(block.cid, [block])

  // upload to Web3.Storage using putCar
  console.log('🤖 Storing simple CBOR object...')
  const cid = await storage.putCar(car)
  console.log(`🎉 Done storing simple CBOR object. CID: ${cid}`)
  console.log(`💡 If you have ipfs installed, try: ipfs dag get ${cid}\n`)
}

/**
 * Stores a CBOR object that links to another CBOR object by CID.
 * @param {Web3Storage} storage a Web3.Storage client
 */
async function cborLinkExample (storage) {
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

  // upload to Web3.Storage using putCar
  console.log('🤖 Storing CBOR objects with CID links between them...')
  const cid = await storage.putCar(car)
  console.log('🎉 Stored linked data using dag-cbor. Root CID:', cid)
  console.log(`💡 If you have ipfs installed, try: ipfs dag get ${cid}`)
  console.log(`🔗 You can also traverse the link by path: ipfs dag get ${cid}/contact\n`)
}

/**
 * Encodes an object into an IPLD block using the dag-cbor codec.
 * @param {any} value - any JS value that can be converted to CBOR (if it can be JSON.stringified, it will work)
 * @returns {Block} a block of encoded IPLD data.
 */
async function encodeCborBlock (value) {
  return encode({ value, codec: cbor, hasher: sha256 })
}

/**
 * Takes a root CID and an iterable of encoded IPLD blocks, and returns a CarReader that
 * can be used with Web3.Storage.putCar
 * @param {string} rootCID the CID of the root block of the IPLD graph
 * @param {Iterable<Block>} ipldBlocks a collection of encoded IPLD blocks
 * @returns {CarReader} a CarReader for sending the CAR data to Web3.Storage
 */
async function makeCar (rootCID, ipldBlocks) {
  return new CarReader(1, [rootCID], ipldBlocks)
}

/**
 * @typedef {import 'multiformats/block'.Block} Block
 */
