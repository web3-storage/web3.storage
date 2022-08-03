import debug from 'debug'
import retry from 'p-retry'

const MAX_REQUEST_PAGE = 10
const W3NAME_API_URL_STAGING = 'https://name.web3.storage/'
const W3NAME_API_URL_PRODUCTION = 'https://name-staging.web3.storage/'
const log = debug('names:postNamesToW3name')

/**
 * @param {{
 *   env: string
 *   db: import('@web3-storage/db').DBClient
 * }} config
 */
export async function postNamesToW3name ({ env, db }) {
  const w3nameApiURL = getW3NameAPIURL(env)
  let from = 0
  let to = MAX_REQUEST_PAGE - 1

  while (true) {
    if (log.enabled) {
      console.log('Query page', from, to)
    }

    const queryRes = await retry(() => db.listNames({ from, to }), { onFailedAttempt: log })

    if (queryRes.length > 0) {
      await Promise.all(queryRes.map((name) => postKeyW3Name(name, w3nameApiURL)))
      from = to + 1
      to = from + MAX_REQUEST_PAGE - 1
    } else {
      if (log.enabled) {
        console.log('Finished')
      }
      break
    }
  }
}

/**
 * @param {string} env
 * @returns {string}
 */
function getW3NameAPIURL (env) {
  switch (env) {
    case 'dev':
      return 'http://localhost:8989'
    case 'staging':
      return W3NAME_API_URL_STAGING
    case 'production':
      return W3NAME_API_URL_PRODUCTION
  }
  return ''
}

/**
 * @param {import('@web3-storage/db/db-client-types').NameItem} name
 * @returns {Promise<void>}
 */
async function postKeyW3Name (name, w3nameApiURL = '') {
  const key = name.key

  if (!w3nameApiURL) { return }

  const res = await fetch(`${w3nameApiURL}/name/${key}`, {
    method: 'POST',
    body: name.record
  })

  if (log.enabled) {
    console.log(res.status, res.statusText, await res.text())
  }
}
