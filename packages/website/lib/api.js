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
 * Gets files
 * @param {object} args
 * @param {number} args.size
 * @param {string} args.before
 * @param {string} [args.sortBy] Can be either "Date" or "Name" - uses "Date" as default
 * @param {string} [args.sortOrder] Can be either "Asc" or "Desc" - uses "Desc" as default
 * @returns {Promise<import('web3.storage').Upload[]>}
 * @throws {Error} When it fails to get uploads
 */
export async function getUploads({ size, before, sortBy, sortOrder }) {
  const params = new URLSearchParams({ before, size: String(size) })
  if (sortBy) {
    params.set('sortBy', sortBy)
  }

  if (sortOrder) {
    params.set('setOrder', sortOrder)
  }

  const res = await fetch(`${API}/user/uploads?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  })

  if (!res.ok) {
    throw new Error(`failed to get uploads: ${await res.text()}`)
  }

  return res.json()
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