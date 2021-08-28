import { Web3Storage, filesFromPath } from 'web3.storage'
import { writeFiles } from 'ipfs-car/unpack/fs'
import enquirer from 'enquirer'
import Conf from 'conf'
import path from 'path'
import ora from 'ora'
import fs from 'fs'
import { CarIndexedReader } from '@ipld/car'

const API = 'https://api.web3.storage'

const config = new Conf({
  projectName: 'w3',
  projectVersion: getPkg().version
})

/**
 * Get a new API client configured either from opts or config
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 * @param {boolean} [opts.json]
 */
function getClient ({
  api = config.get('api') || API,
  token = config.get('token'),
  json = false
}) {
  if (!token) {
    console.log('! run `w3 token` to set an API token to use')
    process.exit(-1)
  }
  const endpoint = new URL(api)
  if (api !== API && !json) {
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
 * Print out all the uploads in your account by data created
 *
 * @param {object} [opts]
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 * @param {number} [opts.size] number of results to return per page
 * @param {string} [opts.before] list items uploaded before this iso date string
 */
export async function list (opts = {}) {
  const client = getClient(opts)
  let count = 0
  let bytes = 0
  for await (const item of client.list()) {
    if (opts.json) {
      console.log(JSON.stringify(item))
    } else if (opts.cid) {
      console.log(item.cid)
    } else {
      if (count === 0) {
        console.log(`  Content ID${Array.from(item.cid).slice(0, -10).fill(' ').join('')}  Name`)
      }
      console.log(`⁂ ${item.cid}  ${item.name}`)
    }
    bytes += item.dagSize
    count++
  }
  if (!opts.json && !opts.cid) {
    if (count === 0) {
      console.log('⁂ No uploads!')
      console.log('⁂ Try out `w3 put <path to files>` to upload some')
    } else {
      console.log(`  ${count} item${count === 1 ? '' : 's'} – ${filesize(bytes)} stored `)
    }
  }
}

/**
 * Add 1 or more files/directories to web3.storage
 *
 * @param {string} firstPath the first file path to store
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 * @param {string} [opts.wrap] wrap with directory
 * @param {string} [opts.name] upload name
 * @param {boolean} [opts.hidden] include paths that start with .
 * @param {boolean|number} [opts.retry] set maxRetries for client.put
 * @param {string[]} opts._ additonal paths to add
 */
export async function put (firstPath, opts) {
  const paths = checkPathsExist([firstPath, ...opts._])
  const client = getClient(opts)
  // pass either --no-retry or --retry <number>
  const maxRetries = Number.isInteger(Number(opts.retry))
    ? Number(opts.retry)
    : opts.retry === false ? 0 : undefined
  if (maxRetries !== undefined) {
    console.log(`⁂ maxRetries: ${maxRetries}`)
  }
  const name = opts.name !== undefined ? opts.name : undefined
  const hidden = !!opts.hidden
  const files = []
  let totalSize = 0
  let totalSent = 0
  const spinner = ora('Packing files').start()
  for (const p of paths) {
    for await (const file of filesFromPath(p, { hidden })) {
      totalSize += file.size
      files.push(file)
      spinner.text = `Packing ${files.length} file${files.length === 1 ? '' : 's'} (${filesize(totalSize)})`
    }
  }
  let rootCid = ''
  const root = await client.put(files, {
    maxRetries,
    name,
    wrapWithDirectory: opts.wrap,
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

/**
 * Add CAR file to web3.storage
 *
 * @param {string} firstPath the first file path to store
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 * @param {string} [opts.name] upload name
 * @param {boolean|number} [opts.retry] set maxRetries for client.putCar
 */
export async function putCar (firstPath, opts) {
  checkPathsExist([firstPath])
  const client = getClient(opts)
  // pass either --no-retry or --retry <number>
  const maxRetries = Number.isInteger(Number(opts.retry))
    ? Number(opts.retry)
    : opts.retry === false ? 0 : undefined
  if (maxRetries !== undefined) {
    console.log(`⁂ maxRetries: ${maxRetries}`)
  }
  const spinner = ora('Reading CAR').start()
  const carReader = await CarIndexedReader.fromFile(firstPath)
  const roots = await carReader.getRoots()
  if (roots.length > 1) {
    spinner.fail(`Cannot add CAR file with multiple roots. ${firstPath} contains mulitple roots.`)
    process.exit(1)
  }
  if (roots.length < 1) {
    spinner.fail(`CAR must have a root CID. ${firstPath} has no roots.`)
    process.exit(1)
  }
  const stats = fs.statSync(firstPath)
  spinner.stopAndPersist({ symbol: '#', text: roots[0].toString() })
  const totalSize = stats.size
  if (totalSize > 1024 * 1024 * 10) {
    spinner.start('Chunking')
  } else {
    spinner.start('Storing')
  }
  let totalSent = 0
  const root = await client.putCar(carReader, {
    name: opts.name !== undefined ? opts.name : undefined,
    maxRetries,
    onStoredChunk: (size) => {
      totalSent += size
      spinner.text = `Storing ${Math.round((totalSent / totalSize) * 100)}%`
    }
  })
  spinner.stopAndPersist({ symbol: '⁂', text: `Stored ${filesize(totalSize)}` })
  console.log(`⁂ https://dweb.link/ipfs/${root}`)
}

function filesize (bytes) {
  const size = bytes / 1024 / 1024
  return `${size.toFixed(1)}MB`
}

export function getPkg () {
  return JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)))
}

function checkPathsExist (paths) {
  paths = Array.isArray(paths) ? paths : [paths]
  for (const p of paths) {
    if (!fs.existsSync(p)) {
      console.error(`The path ${path.resolve(p)} does not exist`)
      process.exit(1)
    }
  }
  return paths
}
