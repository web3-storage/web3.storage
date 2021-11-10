// Needed by @magic-sdk/admin.
// In webpack config we replace node-fetch with this file.
export default globalThis.fetch.bind(globalThis)

export const Headers = globalThis.Headers
