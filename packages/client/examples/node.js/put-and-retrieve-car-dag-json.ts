import process from 'process'
import minimist from 'minimist'
import { CarReader, CarWriter } from '@ipld/car'
import * as json from '@ipld/dag-json'
import { encode } from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'
import { Web3Storage } from 'web3.storage'

// This file contains an example of uploading DAG-JSON-encoded IPLD data to Web3.Storage
// by creating a Content Archive (CAR) and using the putCar client method.
// It also shows how you can retrieve it again.
//
// See https://web3.storage/docs/how-tos/work-with-car-files/#advanced-ipld-formats

async function main () {
  const args = minimist(process.argv.slice(2))
  const token = args['token']

  if (!token) {
    console.error('The argument --token is required. You can create one on https://web3.storage')
    return
  }

  const storage = new Web3Storage({ token })
  await exampleDagJsonStoreAndRetrieve(storage)
}
main()

export async function exampleDagJsonStoreAndRetrieve(client: Web3Storage) {
	const cid = await storeDagJSON(client, { 'foo': `TEST ${new Date()}` })
	const data = await retrieveDagJSON(client, cid)
	console.log('Final retrieved data:', data)
}

async function storeDagJSON(client: Web3Storage, jsonObject: any) {
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
	const cid = await client.putCar(reader, {
		name: 'putCar using dag-json',
		// include the dag-json codec in the decoders field
		decoders: [json],
	})
	console.log('Stored dag-json:', cid)
	return cid
}

async function retrieveDagJSON(client: Web3Storage, cid: string) {
	// Fetch the CAR file from web3.storage
	console.log('Retrieving:', cid)
	const response = await client.get(cid)
	if (!response?.ok) {
		throw new Error(`unexpected response ${response?.statusText}`)
	}

	// The data is an AsyncIterable<Uint8Array>, convert it to an AsyncIterable for the CarReader
	const bodyReader = response.body!.getReader()
	const data: AsyncIterable<Uint8Array> = (async function*() {
		while (true) {
			const { done, value } = await bodyReader.read()
			if (done) {
				break
			}
			yield value
		}
	})()

	// Create a CarReader from the CAR data
	const reader = await CarReader.fromIterable(data)

	// Get the root CID
	const [rootCid] = await reader.getRoots()
	if (!rootCid) throw new Error("no root CID")

	// Fetch the dag-json block
	const block = await reader.get(rootCid)
	if (!rootCid) throw new Error("root block not found")
	console.log('block:', block!.cid)

	// Decode the block to a JSON object
	const jsonObject = json.decode(block!.bytes)

	return jsonObject
}