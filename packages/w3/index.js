import { globSource } from './utils/glob-source.js'
import { writeFiles } from 'ipfs-car/unpack/fs'
import { Web3Storage } from 'web3.storage'

export default async function ({ input, flags }) {
  const client = new Web3Storage({ token: flags.token, endpoint: flags.api })
  if (flags.get) {
    const res = await client.get(flags.get)
    await writeFiles(res.unixFsIterator(), flags.output)
    return
  }
  if (flags.put) {
    const files = []
    console.log('')
    for await (const file of globSource(flags.put)) {
      console.log(`+ ${file.name}`)
      files.push(file)
    }
    const root = await client.put(files)
    console.log(`⁂ https://dweb.link/ipfs/${root}`)
    return
  }
}
