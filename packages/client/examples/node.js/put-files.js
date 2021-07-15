import fs from 'fs'
import process from 'process'
import { Web3Storage, File } from '../../src/lib.js'

const endpoint = process.env.ENDPOINT || 'https://api.web3.storage' // the default
const token = process.env.TOKEN // your API key from https://web3.storage/manage

// TODO: Receive as cli param

async function main () {
  if (!token) {
    console.error('A token is needed. You can create one on https://web3.storage/manage')
    return
  }

  console.log('endpoint', endpoint)
  console.log('token', token)

  const storage = new Web3Storage({ endpoint, token })

  // const files = prepareFiles()

  const cid = await storage.put([{
    stream: () => fs.createReadStream('./fixtures/a.txt'),
    name: 'fixtures/a.txt'
  }])

  console.log('added', cid)
}

// TODO: Read a fixtures folder instead
function prepareFiles () {
  const data = 'Hello web3.storage!!!'
  const data2 = 'Hello web3.storage!!!!'

  return [
    new File(
      [data],
      '/dir/data.txt'
    ),
    new File(
      [data2],
      '/dir/data2.txt'
    ),
    new File(
      [data],
      '/dir/otherdir/data.txt'
    ),
    new File(
      [data2],
      '/dir/otherdir/data2.txt'
    )
  ]
}

main()
