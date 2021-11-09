// This script will upload the contents of the `dist` folder to web3.storage, so you
// can view the application using an IPFS gateway.

const fs = require('fs')
const { Web3Storage, getFilesFromPath } = require('web3.storage')

function die(message) {
  console.error(message)
  process.exit(1)
}

async function deploy() {
  const { WEB3STORAGE_TOKEN } = process.env
  if (!WEB3STORAGE_TOKEN) {
    die('this script needs an env variable named WEB3STORAGE_TOKEN containing API token for web3.storage')
  }
  
  if (!fs.existsSync('./dist')) {
    die('dist folder not found. Try running this first: npm run build')
  }
  
  const web3Storage = new Web3Storage({ token: WEB3STORAGE_TOKEN })
  console.log('Loading site files...')
  const files = await getFilesFromPath('./dist')
  console.log(`Uploading ${files.length} files to Web3.Storage...`)
  const cid = await web3Storage.put(files, { wrapWithDirectory: false })
  console.log('Deployed to Web3.Storage!')
  console.log('Root cid: ', cid)
  console.log(`Gateway url: https://${cid}.ipfs.dweb.link`)
}

deploy()
  .catch(console.error)
