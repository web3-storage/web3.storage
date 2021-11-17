const API = /** @type {string} **/ (process.env.NEXT_PUBLIC_API)
const MAGIC_TOKEN = /** @type {string} **/ (process.env.NEXT_PUBLIC_MAGIC)

export default {
  API: API,
  MAGIC_TOKEN: MAGIC_TOKEN,
  MAGIC_TOKEN_LIFESPAN: 900_000 // 15 mins
}
