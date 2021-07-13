import { packToBlob } from 'ipfs-car/pack/blob'

/**
 * @param {string} str Data to encode into CAR file.
 */
export async function createCar (str) {
  return await packToBlob({
    input: new TextEncoder().encode(str)
  })
}
