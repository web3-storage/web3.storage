import { globSource } from './utils/glob-source.js'
import { writeFiles } from 'ipfs-car/unpack/fs'
import { Web3Storage } from 'web3.storage'
import enquirer from 'enquirer'
import Conf from 'conf'
import ora from 'ora'

const API = 'https://api.web3.storage'
const config = new Conf()

/**
 * Get a new API client configured either from opts or config
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 */
function getClient ({
  api = config.get('api') || API,
  token = config.get('token')
}) {
  if (!token) {
    console.log('! run `w3 token` to set an API token to use')
    process.exit(-1)
  }
  const endpoint = new URL(api)
  if (api !== API) {
    // note if we're using something other than prod.
    console.log(`⁂ using ${endpoint.hostname}`)
  }
  return new Web3Storage({ token, endpoint })
}

/**
 * Set the token and optionally the api to use
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 */
export async function token ({ delete: del, token, api = API }) {
  if (del) {
    config.delete('token')
    config.delete('api')
    console.log('⁂ API token deleted')
    return
  }

  const url = new URL(api)
  if (!token) {
    const response = await enquirer.prompt({
      type: 'input',
      name: 'token',
      message: `Paste your API token for ${url.hostname}`
    })
    token = response.token
  }
  config.set('token', token)
  config.set('api', api)
  console.log('⁂ API token saved')
}

/**
 * Get data on Filecoin deals and IPFS pins that contain a given CID, as JSON.
 *
 * @param {string} cid the root CID to fetch
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 * @param {string} [opts.output] the path to write the files to
 */
export async function status (cid, opts) {
  const client = getClient(opts)
  const status = await client.status(cid)
  console.log(JSON.stringify(status, null, 2))
}

/**
 * Download and verify a file/directory by CID and write it to disk.
 *
 * @param {string} cid the root CID to fetch
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 * @param {string} [opts.output] the path to write the files to
 */
export async function get (cid, opts) {
  const client = getClient(opts)
  const res = await client.get(cid)
  await writeFiles(res.unixFsIterator(), opts.output)
}

/**
 * Add 1 or more files/directories to web3.storage
 *
 * @param {string} path the first file path to store
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 * @param {string[]} opts._ additonal paths to add
 */
export async function put (path, opts) {
  const client = getClient(opts)
  const spinner = ora('Packing files').start()
  const paths = [path, ...opts._]
  const files = []
  let totalSize = 0
  let totalSent = 0
  for (const p of paths) {
    for await (const file of globSource(p)) {
      totalSize += file.size
      files.push(file)
      spinner.text = `Packing ${files.length} file${files.length === 1 ? '' : 's'} (${filesize(totalSize)})`
    }
  }
  let rootCid = ''
  const root = await client.put(files, {
    onRootCidReady: (cid) => {
      rootCid = cid
      spinner.stopAndPersist({ symbol: '#', text: `Packed ${files.length} file${files.length === 1 ? '' : 's'} (${filesize(totalSize)})` })
      console.log(`# ${rootCid}`)
      if (totalSize > 1024 * 1024 * 10) {
        spinner.start('Chunking')
      } else {
        spinner.start('Storing')
      }
    },
    onStoredChunk: (size) => {
      totalSent += size
      spinner.text = `Storing ${Math.round((totalSent / totalSize) * 100)}%`
    }
  })
  spinner.stopAndPersist({ symbol: '⁂', text: `Stored ${files.length} file${files.length === 1 ? '' : 's'}` })
  console.log(`⁂ https://dweb.link/ipfs/${root}`)
}

function filesize (bytes) {
  const size = bytes / 1024 / 1024
  return `${size.toFixed(1)}MB`
}
