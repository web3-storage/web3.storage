import process from 'process'
import minimist from 'minimist'
import { Web3Storage } from 'web3.storage'
import fs from 'fs'

async function main () {
  const args = minimist(process.argv.slice(2))
  const token = args.token

  if (!token) {
    console.error('A token is needed. You can create one on https://web3.storage')
    return
  }

  const storage = new Web3Storage({ token })

  const stream = fs.createReadStream('./fixtures/data.txt')
  const cid = await storage.put([{ name: 'data.txt', stream: () => stream }])

  console.log('Content added with CID:', cid)
}

main()
