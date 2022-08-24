const API = /** @type {string} **/ (process.env.NEXT_PUBLIC_API);
const MAGIC_TOKEN = /** @type {string} **/ (process.env.NEXT_PUBLIC_MAGIC);

// In dev, set these vars in a .env file in the parent monorepo project root.
if (!API) {
  throw new Error('MISSING ENV. Please set NEXT_PUBLIC_API');
}
if (!MAGIC_TOKEN) {
  throw new Error('MISSING ENV. Please set NEXT_PUBLIC_MAGIC');
}

export default {
  API: API,
  MAGIC_TOKEN: MAGIC_TOKEN,
  MAGIC_TOKEN_LIFESPAN: 900_000, // 15 mins
};
