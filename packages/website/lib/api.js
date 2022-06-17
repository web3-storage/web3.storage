import { getMagic } from './magic'
import constants from './constants'

/** @typedef {{ name?: string } & import('web3.storage').Upload} Upload */

export const API = constants.API

const LIFESPAN = constants.MAGIC_TOKEN_LIFESPAN / 1000
/** @type {string | undefined} */
let token
let created = Date.now() / 1000

export async function getToken() {
  const magic = getMagic()
  const now = Date.now() / 1000
  if (token === undefined || now - created > LIFESPAN - 10) {
    token = await magic.user.getIdToken({ lifespan: LIFESPAN })
    created = Date.now() / 1000
  }
  return token
}

export async function getTokens() {
  const res = await fetch(API + '/user/tokens', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  })

  if (!res.ok) {
    throw new Error(`failed to get auth tokens: ${await res.text()}`)
  }

  return res.json()
}

export async function getStorage() {
  const res = await fetch(API + '/user/account', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  })

  if (!res.ok) {
    throw new Error(`failed to get storage info: ${await res.text()}`)
  }

  return res.json()
}

export async function getInfo() {
  const res = await fetch(API + '/user/info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  })

  if (!res.ok) {
    throw new Error(`failed to get user info: ${await res.text()}`)
  }

  return res.json()
}

/**
 * Delete Token
 *
 * @param {string} _id
 */
export async function deleteToken(_id) {
  const res = await fetch(`${API}/user/tokens/${_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    }
  })

  if (!res.ok) {
    throw new Error(`failed to delete auth token: ${await res.text()}`)
  }
}

/**
 * Create Token
 *
 * @param {string} name
 */
export async function createToken(name) {
  const res = await fetch(API + '/user/tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    body: JSON.stringify({ name }),
  })

  if (!res.ok) {
    throw new Error(`failed to create auth token: ${await res.text()}`)
  }

  return res.json()
}

/**
 * @typedef {Object} UploadArgs
 * @property {number} args.size Defines the amount of results to return
 * @property {number} [args.offset] Return results offset by a given number (used for API pagination)
 * @property {string} [args.before] Filter results before a given date in ISO 8601 format
 * @property {string} [args.after] Filter results after a given date in ISO 8601 format
 * @property {string} [args.sortBy] Can be either "Date" or "Name" - uses "Date" as default
 * @property {string} [args.sortOrder] Can be either "Asc" or "Desc" - uses "Desc" as default
 */

/**
 * @typedef {Object} HeaderMeta
 * @property {?string} [args.size] Defines the amount of results to return
 * @property {?string} [args.offset] Return results offset by a given number (used for API pagination)
 * @property {?string} [args.count] Can be either "Date" or "Name" - uses "Date" as default
 * @property {?string} [args.nextLink]
 * @property {?string} [args.prevLink]
 */

/**
 * @typedef {Object} UploadResults
 * @property {import('web3.storage').Upload[]} results - List of requested uploads
 * @property {HeaderMeta} meta - Metadata relating to the pagination of results
 */

/**
 * Gets files
 * @param {UploadArgs} args
 * @returns {Promise<UploadResults>}
 * @throws {Error} When it fails to get uploads
 */
export async function getUploads({ size, before, after, sortBy, sortOrder, offset }) {
  const params = new URLSearchParams({ size: String(size) })

  if (offset) {
    params.set('offset', String(offset))
  }

  if (sortBy) {
    params.set('sortBy', sortBy)
  }

  if (sortOrder) {
    params.set('sortOrder', sortOrder)
  }

  if (before) {
    params.set('before', before)
  }

  if (after) {
    params.set('after', after)
  }
  const res = await fetch(`${API}/user/uploads?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Expose-Headers': '*',
      'Access-Control-Allow-Headers': 'count',
      'Access-Control-Response-Headers': 'count',
      Authorization: 'Bearer ' + (await getToken()),
    },
  })

  /** @type HeaderMeta */
  const meta = {
    offset: res.headers.get('Offset'),
    nextLink: res.headers.get('Next_link'),
    prevLink: res.headers.get('Prev_link'),
    size: res.headers.get('Size'),
    count: res.headers.get('Count'),
  }

  if (!res.ok) {
    throw new Error(`failed to get uploads: ${await res.text()}`)
  }

  const results = await res.json()

  return {
    meta,
    results,
  }
}

/**
 * Deletes upload
 *
 * @param {string} cid
 */
export async function deleteUpload (cid) {
  const res = await fetch(`${API}/user/uploads/${cid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    }
  })

  if (!res.ok) {
    throw new Error(`failed to delete upload: ${await res.text()}`)
  }
}

/**
 * Renames upload
 *
 * @param {string} cid
 * @param {string} name
 */
export async function renameUpload (cid, name) {
  const res = await fetch(`${API}/user/uploads/${cid}/rename`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    body: JSON.stringify({
      name
    })
  })

  if (!res.ok) {
    throw new Error(`failed to delete upload: ${await res.text()}`)
  }
}

export async function getVersion() {
  const route = '/version'
  const res = await fetch(`${API}${route}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (res.ok) {
    return await res.json()
  } else {
    throw new Error(await res.text())
  }
}

/**
 * Gets files pinned through the pinning API
 *
 * @param {string} status
 * @param {string} token
 * @returns {Promise<import('../components/contexts/uploadsContext').PinsList>}
 * @throws {Error} When it fails to get uploads
 */
export async function listPins(status, token) {
  console.log('gettin pins')
  // const res = await fetch(`${API}/pins?status=${status}`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: 'Bearer ' + token, // **** this needs to be a token generated from the tokens context
  //   },
  // })
  // if (!res.ok) {
  //   throw new Error(`failed to get pinned files: ${await res.text()}`)
  // }

  const mockPins = {
    count: 1,
    result: [
      {
        requestid: '',
        status: '',
        created: '',
        pinObject: {
          cid: '',
          _id: '',
          contentCid: '',
          sourceCid: '',
          authKey: '',
          name: '',
          meta: '',
          deleted: false,
          created: '',
          updated: '',
          pins: [],
          delegates: '',
        },
      },
    ],
  };

/**
 * @typedef {Object} PinObject
 * @property {string} cid
 * @property {string} _id
 * @property {string} sourceCid
 * @property {string} contentCid
 * @property {string} authKey
 * @property {string} name
 * @property {any} meta
 * @property {boolean | null} deleted
 * @property {string} created
 * @property {string} updated
 * @property {Pin[]} pins
 * @property {string[]} delegates
 */

/**
 * @typedef {Object} PinStatus
 * @property {string} requestid
 * @property {string} status
 * @property {string} created
 * @property {PinObject} pin
 */

/**
 * @typedef {Object} PinsList
 * @property {number} count
 * @property {PinStatus[]} results
 */

  return mockPins;
}
