import { Web3Storage } from '../../src/lib.js'

// TODO
const endpoint = 'https://api.web3.storage' // the default
const token = 'API_KEY' // your API key from https://web3.storage/manage

async function main() {
  const storage = new Web3Storage({ endpoint, token }) 

  const files = prepareFiles()
  const cid = await storage.put(files)

  console.log('added', cid)
}

// TODO: Read a fixtures folder instead
function prepareFiles () {
  const data = 'Hello web3.storage!'
  const data2 = 'Hello web3.storage!!'

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
