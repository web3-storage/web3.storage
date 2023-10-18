/**
 * Converts a string to a number.
 *
 * @param {string} s
 * @returns {number|undefined}
 */
export const stringToNumber = (s) => {
  const n = parseFloat(s)
  if (isNaN(n)) {
    return undefined
  }
  return n
}
