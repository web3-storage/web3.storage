import { parseLinkHeader } from '@web3-storage/parse-link-header';

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
 * @property {number} [args.size]
 * @property {number} [args.page]
 * @property {string} [args.sortBy] Can be either "Date" or "Name" - uses "Date" as default
 * @property {string} [args.sortOrder] Can be either "Asc" or "Desc" - uses "Desc" as default
 */

/**
 * Gets files
 *
 * @param {UploadArgs} [args]
 * @returns {Promise<{ uploads: import('web3.storage').Upload[], pages: number, count: number }>}
 * @throws {Error} When it fails to get uploads
 */
export async function getUploads({ size, page, sortBy, sortOrder } = {}) {
  const params = new URLSearchParams({ page: String(page || 1), size: String(size || 10) });
  if (sortBy) {
    params.set('sortBy', sortBy);
  }

  if (sortOrder) {
    params.set('sortOrder', sortOrder);
  }
  const res = await fetch(`${API}/user/uploads?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  });

  if (!res.ok) {
    throw new Error(`failed to get uploads: ${await res.text()}`);
  }

  const links = parseLinkHeader(res.headers.get('Link') || '');
  if (!links?.last?.page) {
    throw new Error('missing last rel in pagination Link header');
  }

  const pages = parseInt(links.last.page);
  const count = parseInt(res.headers.get('Count') || '0');

  return { uploads: await res.json(), pages, count };
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
 * Gets pin requests.
 *
 * @param {{ status: string, page: number, size: number }} args
 * @returns {Promise<{ count: number, results: import('../components/contexts/pinRequestsContext').PinStatus[] }>}
 */
export async function getPinRequests({ status, size, page }) {
  const res = await fetch(`${API}/user/pins?status=${status}&size=${size}&page=${page}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  });
  if (!res.ok) {
    throw new Error(`failed to get pinned files: ${await res.text()}`);
  }

  return res.json();
}

/**
 * Deletes a pin request.
 *
 * @param {string} requestid
 */
export async function deletePinRequest(requestid) {
  const res = await fetch(`${API}/user/pins/${encodeURIComponent(requestid)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
  })

  if (!res.ok) {
    throw new Error(`failed to delete pin request: ${await res.text()}`);
  }
}

/*
 * Try return the input parsed as JSON. If it's not possible, return the input.
 * (This is useful for logging responses that may or may not be JSON.)
 * @param {string} text
 * @returns {unknown}
 */
function parseJsonOrReturn(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export const apiIssueSupportEmail = 'support@web3.storage';
export const defaultErrorMessageForEndUser = `An unexpected error has occurred. Please try again. If this error continues to happen, please contact us at ${apiIssueSupportEmail}.`;

/**
 * Error indicating that an unexpected error happened when invoking the API, but nothing more specific than that.
 */
export class APIError extends Error {}

/**
 * Error indicating that an unexpected API Response was encountered
 */
export class UnexpectedAPIResponseError extends APIError {
  /**
   * @param {Response} response
   * @param {string} message
   */
  constructor(response, message) {
    super(message);
    this.response = response;
  }
}

/**
 * @typedef {import('../components/contexts/plansContext').StorageSubscription} StorageSubscription
 */

/**
 * @typedef {'web3.storage-tos-v1'} W3STermsOfServiceAgreement
 */

/** @type {Record<number, W3STermsOfServiceAgreement>} */
export const tosAgreementVersions = {
  1: /** @type {const} */ ('web3.storage-tos-v1'),
};

/**
 * Type guard to check whether a value is a valid terms of service agreement
 * @param {any} value
 * @returns {value is W3STermsOfServiceAgreement}
 */
export function isW3STermsOfServiceAgreement(value) {
  for (const agreement of Object.values(tosAgreementVersions)) {
    if (value === agreement) {
      return true;
    }
  }
  return false;
}

/**
 * Gets/Puts saved user plan and billing settings.
 * @param {W3STermsOfServiceAgreement|undefined} agreement
 * @param {string} [pmId] - payment method id
 * @param {StorageSubscription} [storageSubscription]
 */
export async function userBillingSettings(agreement, pmId, storageSubscription) {
  const putBody =
    pmId || storageSubscription
      ? JSON.stringify({
          paymentMethod: pmId ? { id: pmId } : null,
          subscription: typeof storageSubscription === 'undefined' ? undefined : { storage: storageSubscription },
          agreement,
        })
      : null;
  const method = !!putBody ? 'PUT' : 'GET';
  const token = await getToken();
  const path = '/user/payment';
  /** @type {Response} */
  let response;
  try {
    response = await fetch(new URL(path, API).toString(), {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: putBody,
    });
  } catch (error) {
    const message = 'unexpected error fetching user payment settings';
    console.warn(message, error);
    throw new APIError(message);
  }
  if (!response.ok) {
    const message = `Unexpected ${response.status} response requesting ${method} ${path}`;
    console.warn(`${message}. Response:`, await response.text().then(parseJsonOrReturn));
    throw new UnexpectedAPIResponseError(response, message);
  }
  const savedPayment = await response.json();
  return savedPayment;
}

/**
 * Saves the end-user's default payment method via http api
 * @param {string} paymentMethodId - stripe.com payment method id
 */
export async function saveDefaultPaymentMethod(paymentMethodId) {
  return await userBillingSettings(undefined, paymentMethodId);
}
