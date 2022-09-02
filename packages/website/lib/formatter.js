import filesz from 'filesize';

/** @type {object} */
const defaultOptions = {
  base: 2,
  standard: 'iec',
};

/**
 * local filesize formatter abstraction with default options
 *
 * @param {any} value
 */
export const fileSize = value => filesz(value, defaultOptions);
