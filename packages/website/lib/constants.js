let API = /** @type {string} **/ (process.env.NEXT_PUBLIC_API)
let MAGIC_TOKEN = /** @type {string} **/ (process.env.NEXT_PUBLIC_MAGIC)

if (globalThis.window) {
  switch (location.host) {
    case 'staging.web3.storage':
      API = 'https://api-staging.web3.storage'
      MAGIC_TOKEN = ''
      break
    case 'web3.storage':
      API = 'https://api.web3.storage'
      MAGIC_TOKEN = ''
      break
    default:
      break
  }
}

export default {
  API: API,
  MAGIC_TOKEN: MAGIC_TOKEN,
}
