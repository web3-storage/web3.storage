import { getMagic } from './magic';
import constants from './constants';

/** @typedef {{ name?: string } & import('web3.storage').Upload} Upload */

export const API = constants.API;

const LIFESPAN = constants.MAGIC_TOKEN_LIFESPAN / 1000;
/** @type {string | undefined} */
let token;
let created = Date.now() / 1000;

export async function getToken() {
  const magic = getMagic();
  const now = Date.now() / 1000;
  if (token === undefined || now - created > LIFESPAN - 10) {
    token = await magic.user.getIdToken({ lifespan: LIFESPAN });
    created = Date.now() / 1000;
  }
  return token;
}

export async function getTokens() {
  const res = await fetch(API + '/user/tokens', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  });

  if (!res.ok) {
    throw new Error(`failed to get auth tokens: ${await res.text()}`);
  }

  return res.json();
}

export async function getStorage() {
  const res = await fetch(API + '/user/account', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  });

  if (!res.ok) {
    throw new Error(`failed to get storage info: ${await res.text()}`);
  }

  return res.json();
}

export async function getInfo() {
  const res = await fetch(API + '/user/info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  });

  if (!res.ok) {
    throw new Error(`failed to get user info: ${await res.text()}`);
  }

  return res.json();
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
    },
  });

  if (!res.ok) {
    throw new Error(`failed to delete auth token: ${await res.text()}`);
  }
}

export async function createUserRequest(tagName, requestedTagValue, userProposalForm) {
  const res = await fetch(`${API}/user/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    body: JSON.stringify({ tagName, requestedTagValue, userProposalForm }),
  });

  if (!res.ok) {
    throw new Error(`failed to create user request: ${await res.text()}`);
  }
}

export async function createUnlimitedStorageRequest(authMethod, links, dataVolume) {
  await createUserRequest(
    'StorageLimitBytes',
    '',
    JSON.stringify([
      { label: 'Auth Method', value: authMethod },
      { label: 'Links', value: links },
      { label: 'Data Volume', value: dataVolume },
    ])
  );
}

export async function createPinningServiceRequest(reason, examples, profile) {
  await createUserRequest(
    'HasPsaAccess',
    'true',
    JSON.stringify([
      { label: 'Reason', value: reason },
      { label: 'Examples', value: examples },
      { label: 'Profile', value: profile },
    ])
  );
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
  });

  if (!res.ok) {
    throw new Error(`failed to create auth token: ${await res.text()}`);
  }

  return res.json();
}

/**
 * @typedef {Object} UploadArgs
 * @property {string} args.before
 * @property {string} [args.sortBy] Can be either "Date" or "Name" - uses "Date" as default
 * @property {string} [args.sortOrder] Can be either "Asc" or "Desc" - uses "Desc" as default
 * @property {number} [args.itemsPerPage]
 * @property {number} [args.offset]
 */

/**
 * @typedef {Object} UploadResults
 * @property {import('web3.storage').Upload[]} results - List of requested uploads
 * @property {number} count - count of returned uploads
 */

/**
 * Gets files
 *
 * @param {UploadArgs} args
 * @returns {Promise<UploadResults>}
 * @throws {Error} When it fails to get uploads
 */
export async function getUploads({ before, sortBy, sortOrder, itemsPerPage, offset }) {
  const params = new URLSearchParams({ before });
  if (sortBy) {
    params.set('sortBy', sortBy);
  }

  if (sortOrder) {
    params.set('sortOrder', sortOrder);
  }

  if (itemsPerPage) {
    params.set('size', itemsPerPage.toString());
  }

  if (offset) {
    params.set('offset', offset.toString());
  }

  const res = await fetch(`${API}/user/uploads?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  })

  if (!res.ok) {
    throw new Error(`failed to get uploads: ${await res.text()}`);
  }
  const results = await res.json();
  const count = parseInt((res.headers.get('count') ?? '0'), 10);

  return {
    results,
    count
  };
}

/**
 * Deletes upload
 *
 * @param {string} cid
 */
export async function deleteUpload(cid) {
  const res = await fetch(`${API}/user/uploads/${cid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  });

  if (!res.ok) {
    throw new Error(`failed to delete upload: ${await res.text()}`);
  }
}

/**
 * Renames upload
 *
 * @param {string} cid
 * @param {string} name
 */
export async function renameUpload(cid, name) {
  const res = await fetch(`${API}/user/uploads/${cid}/rename`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    body: JSON.stringify({
      name,
    }),
  });

  if (!res.ok) {
    throw new Error(`failed to delete upload: ${await res.text()}`);
  }
}

export async function getVersion() {
  const route = '/version';
  const res = await fetch(`${API}${route}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (res.ok) {
    return await res.json();
  } else {
    throw new Error(await res.text());
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
  const res = await fetch(`${API}/pins?status=${status}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token, // **** this needs to be a token generated from the tokens context
    },
  })
  if (!res.ok) {
    throw new Error(`failed to get pinned files: ${await res.text()}`)
  }

  return res.json()
}
