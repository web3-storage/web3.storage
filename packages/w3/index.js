import { globSource } from './utils/glob-source.js'
import { writeFiles } from 'ipfs-car/unpack/fs'
import { Web3Storage } from 'web3.storage'

export async function get (cid, opts) {
  const client = new Web3Storage({ token: opts.token, endpoint: opts.api })
  const res = await client.get(cid)
  await writeFiles(res.unixFsIterator(), opts.output)
}

export async function put (path, opts) {
  const client = new Web3Storage({ token: opts.token, endpoint: opts.api })
  const files = []
  console.log('')
  for await (const file of globSource(path)) {
    console.log(`+ ${file.name}`)
    files.push(file)
  }
  const root = await client.put(files)
  console.log(`⁂ https://dweb.link/ipfs/${root}`)
}
