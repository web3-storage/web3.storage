import { getMagic } from './magic'
import constants from './constants'

export const API = constants.API

const LIFESPAN = 900
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

/**
 * Delete Token
 *
 * @param {string} name
 */
export async function deleteToken(name) {
  const res = await fetch(API + '/user/tokens', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    body: JSON.stringify({ name }),
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
 * Get files
 *
 * @param {{limit: number, before: string }} query
 * @returns
 */
export async function getFiles({ limit, before }) {
  const params = new URLSearchParams({ before, limit: String(limit) })
  const res = await fetch(`${API}/user/files?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  })

  if (!res.ok) {
    throw new Error(`failed to get files: ${await res.text()}`)
  }

  return res.json()
}
