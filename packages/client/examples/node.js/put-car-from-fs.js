import process from 'process'
import minimist from 'minimist'
import { createReadStream } from 'fs'
import { CarReader } from '@ipld/car'
import { Web3Storage } from 'web3.storage'

// This file has an example of storing a Content Archive (CAR) file using
// the Web3.Storage client's putCar method.
//
// See https://docs.web3.storage/how-tos/work-with-car-files
// for more information about CARs.

async function main () {
  const args = minimist(process.argv.slice(2))
  const token = args.token

  if (!token) {
    console.error('A token is needed. You can create one on https://web3.storage')
    return
  }

  const storage = new Web3Storage({ token })
  const inStream = createReadStream('./fixtures/fixture.car')
  const car = await CarReader.fromIterable(inStream)
  const cid = await storage.putCar(car)

  console.log('Content added from CAR file with CID:', cid)
}

main()
