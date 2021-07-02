import { writeFiles } from 'ipfs-car/unpack/fs'
import { Web3Storage } from 'web3.storage'

export default async function ({ input, flags }) {
  const client = new Web3Storage({ token: 'test', endpoint: flags.api })
  if (flags.get) {
    const res = await client.get(flags.get)
    writeFiles(res.unixFsIterator(), flags.output)
  }
}
