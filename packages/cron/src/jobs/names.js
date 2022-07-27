import debug from 'debug'
import retry from 'p-retry'

const MAX_REQUEST_PAGE = 10
const W3NAME_URL = 'http://localhost:8989'
const log = debug('names:postNamesToW3name')

/**
 * @param {{
 *   db: import('@web3-storage/db').DBClient
 * }} config
 */
export async function postNamesToW3name ({ db }) {
    let from = 0
    let to = MAX_REQUEST_PAGE - 1

    while (true) {
        if (log.enabled) {
            console.log('Query page', from, to)
        }
        const queryRes = await retry(() => db.listNames({ from, to }), { onFailedAttempt: log })
        if (queryRes.length > 0) {
            await Promise.all(queryRes.map(postKeyW3Name))
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
 * @param {import('@web3-storage/db/db-client-types').NameItem} name
 * @returns {Promise<void>}
 */
async function postKeyW3Name (name) {
    const key = name.key

    const res = await fetch(`${W3NAME_URL}/name/${key}`, {
        method: 'POST',
        body: name.record
    })

    if (log.enabled) {
        console.log(res.status, res.statusText, await res.text())
    }
}
