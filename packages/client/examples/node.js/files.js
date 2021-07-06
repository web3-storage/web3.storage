import { Web3Storage, File } from '../../src/lib.js'

// TODO
// const endpoint = 'https://api.web3.storage' // the default
// const token = 'API_KEY' // your API key from https://web3.storage/manage

const endpoint = 'http://127.0.0.1:8787'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpc3N1ZXItMTYyNTU5Mjk3MjgwNiIsImlzcyI6IndlYjMtc3RvcmFnZSIsImlhdCI6MTYyNTU5Mjk3MzIzNywibmFtZSI6InRva2VuLTE2MjU1OTI5NzI4MDYifQ.FxhcrVxOOqiy6jzyLywq6p34hzFk4V1xC_WufLd7E7s'

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
