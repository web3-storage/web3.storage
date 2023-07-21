import { packToBlob } from 'ipfs-car/pack/blob'

/**
 * @param {string} str Data to encode into CAR file.
 * @returns {Promise<{ root: import('multiformats').UnknownLink, car: Blob }>}
 */
export async function createCar (str) {
  // @ts-expect-error old multiformats in ipfs-car
  return await packToBlob({
    input: [new TextEncoder().encode(str)],
    wrapWithDirectory: false
  })
}
