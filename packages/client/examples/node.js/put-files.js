import process from 'process'
import minimist from 'minimist'
import { Web3Storage, File } from 'web3.storage'

async function main () {
  const args = minimist(process.argv.slice(2))
  const token = args.token

  if (!token) {
    console.error('A token is needed. You can create one on https://web3.storage')
    return
  }

  const storage = new Web3Storage({ token })

  const files = prepareFiles()
  const cid = await storage.put(files)

  console.log('Content added with CID:', cid)
}

main()

function prepareFiles () {
  const data = 'Hello web3.storage!'
  const data2 = 'Hello web3.storage! 😎'

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
