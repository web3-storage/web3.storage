/**
 * If it's a different day, it returns the day, otherwise it returns the hour
 * @param {*} timestamp
 * @returns {string}
 */
export const formatTimestamp = timestamp => {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

/**
 * Utility to truncate text
 *
 * @param {string} string The string being truncated
 * @param {number} [len] The max length allowed
 * @param {string} [end] The copy used to truncate at the end
 * @param {'single'|'double'} [type] The type of truncation to use, `single` puts ellipses at the end, `double` in the middle
 * @returns {string}
 */
export const truncateString = (string, len = 30, end = '...', type = 'single') => {
  if (type === 'single') {
    return string.length > len + 3 ? `${string.slice(0, len)}${end}` : string;
  } else {
    return string.length > len + 3 ? `${string.slice(0, len)}${end}${string.slice(-8)}` : string;
  }
};

/**
 * Utility that copies text to the clipboard
 *
 * @param {string} text Text to be copied to clipboard
 */
export const addTextToClipboard = (text) => {
  const container = document.createElement('textarea')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.zIndex = '-1'
  container.style.opacity = '0'
  container.style.pointerEvents = 'none'
  container.innerHTML = text
  document.body.appendChild(container)
  container.select()
  document.execCommand('copy')
  document.body.removeChild(container)
}

/**
 * Utility function to standardize element heights based on largest sibling
 *
 * @param {string} target class list to target
 * @param {boolean} reset whether or not to unset heights before calculation
 */
export const standardizeSiblingHeights = (target, reset) => {
  if (typeof document !== 'undefined') {
    const elements = (
      /** @type {HTMLCollectionOf<HTMLElement>} */
      (document.getElementsByClassName(target))
    );
    const heights = []

    for (let i = 0; i < elements.length; i++) {
      const el = /** @type {HTMLElement} */ (elements[i])
      if (reset) {
        el.style.minHeight = 'unset'
      }
      const rect = el.getBoundingClientRect()
      heights.push(rect.height)
    }

    const max = Math.max(...heights);

    for (let i = 0; i < elements.length; i++) {
      const el = /** @type {HTMLElement} */ (elements[i])
      el.style.minHeight = max + 'px'
    }
  }
}

/**
 * Utility to check if element is in viewport
 *
 * @param {any} element element to test
 * @returns {boolean}
 */
export const elementIsInViewport = (element) => {
  if (element && typeof window !== 'undefined' && typeof document !== 'undefined') {
    const rect = element.getBoundingClientRect();
    return (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight))
  }
  return false
}
