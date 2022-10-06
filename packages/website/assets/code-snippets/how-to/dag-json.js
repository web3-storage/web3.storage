import { Web3Storage } from 'web3.storage'
import { CarReader, CarWriter } from '@ipld/car'
import { encode } from 'multiformats/block'
import * as json from '@ipld/dag-json'
import { sha256 } from 'multiformats/hashes/sha2'

async function storeDagJSON (jsonObject) {
  // encode the json object into an IPLD block
  const block = await encode({ value: jsonObject, codec: json, hasher: sha256 })

  // create a new CarWriter, with the encoded block as the root
  const { writer, out } = CarWriter.create([block.cid])

  // add the block to the CAR and close it
  writer.put(block)
  writer.close()

  // create a new CarReader we can hand to web3.storage.putCar
  const reader = await CarReader.fromIterable(out)

  // upload to web3.storage using putCar
  console.log('uploading car.')
  const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN })
  const cid = await client.putCar(reader, {
    name: 'putCar using dag-json',

    // include the dag-json codec in the decoders field
    decoders: [json]
  })
  console.log('Stored dag-json data! CID:', cid)
}

storeDagJSON({
  hello: 'world'
})
