import fs from 'fs'
import Conf from 'conf'
import { Web3Storage } from 'web3.storage'

export const API = 'https://api.web3.storage'

export const config = new Conf({
  projectName: 'w3',
  projectVersion: getPkg().version,
  configFileMode: 0o600
})

export function getPkg () {
  return JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)))
}

/**
 * Get a new API client configured either from opts or config
 * @param {object} opts
 * @param {string} [opts.api]
 * @param {string} [opts.token]
 * @param {boolean} [opts.json]
 */
export function getClient ({
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