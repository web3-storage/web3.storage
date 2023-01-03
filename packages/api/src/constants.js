export const JWT_ISSUER = 'web3-storage'
export const METRICS_CACHE_MAX_AGE = 10 * 60 // in seconds (10 minutes)
export const DAG_SIZE_CALC_LIMIT = 1024 * 1024 * 9
// Maximum permitted block size in bytes.
export const MAX_BLOCK_SIZE = 1 << 21 // 2MiB
export const UPLOAD_TYPES = ['Car', 'Blob', 'Multipart', 'Upload']
export const PIN_STATUSES = ['PinQueued', 'Pinning', 'Pinned', 'PinError']
export const USER_TAGS = {
  ACCOUNT_RESTRICTION: 'HasAccountRestriction',
  DELETE_RESTRICTION: 'HasDeleteRestriction',
  PSA_ACCESS: 'HasPsaAccess'
}
export const CAR_CODE = 0x202
