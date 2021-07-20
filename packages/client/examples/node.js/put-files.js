import process from 'process'
import minimist from 'minimist'
import { getFilesFromPath } from 'files-from-path'
import { Web3Storage } from 'web3.storage'

const endpoint = 'https://api.web3.storage'

async function main () {
  const args = minimist(process.argv.slice(2))
  const token = args.token

  if (!token) {
    console.error('A token is needed. You can create one on https://web3.storage')
    return
  }

  const storage = new Web3Storage({ endpoint, token })

  const files = await getFilesFromPath('./fixtures')
  const cid = await storage.put(files)

  console.log('Content added with CID:', cid)
}

main()
