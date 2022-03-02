

/**
 * Display a message to the user in the output area.
 * @param {string} text 
 */
export function showMessage(text) {
  const output = document.getElementById('output')
  if (!output) {
    return
  }
  const node = document.createElement('div')
  node.innerText = text
  output.appendChild(node)
}

/**
 * Display a URL in the output area as a clickable link.
 * @param {string} url 
 */
export function showLink(url) {
  const output = document.getElementById('output')
  if (!output) {
    return
  }
  const node = document.createElement('a')
  node.href = url
  node.target = '_external'
  node.innerText = `> 🔗 ${url}`
  output.appendChild(node)
}

// #endregion upload-view

/**
 * Makes a div containing an icon, followed by a text label
 * @param {string} iconClass class for the icon, e.g. 'fontawesome-share'
 * @param {string} labelText
 * @returns {HTMLDivElement}
 */
export function iconLabel(iconClass, labelText) {
  const label = document.createElement('span')
  label.textContent = labelText
  const icon = document.createElement('span')
  icon.className = iconClass
  const div = document.createElement('div')
  div.appendChild(icon)
  div.appendChild(label)
  return div
}

/**
 * Sets window location to the given path, if we're not already there.
 * @param {string} path 
 */
export function navToPath(path) {
  if (window.location.pathname !== path) {
    window.location.pathname = path
  }
}

/**
 * Set window location to the settings page.
 */
export function navToSettings() {
  navToPath('/settings.html')
}

/**
 * Return an IPFS gateway URL for the given CID and path
 * @param {string} cid 
 * @param {string} path 
 * @returns {string}
 */
export function makeGatewayURL(cid, path) {
  return `https://${cid}.ipfs.dweb.link/${encodeURIComponent(path)}`
}

/**
 * Make a File object with the given filename, containing the given object (serialized to JSON).
 * @param {string} filename filename for the returned File object
 * @param {object} obj a JSON-serializable object
 * @returns {File}
 */
export function jsonFile(filename, obj) {
  return new File([JSON.stringify(obj)], filename)
}

/**
 * @returns {string|null} the saved API token
 */
export function getSavedToken() {
  return localStorage.getItem('w3storage-token')
}

/**
 * Saves the given token to local storage
 * @param {string} token 
 */
export function saveToken(token) {
  localStorage.setItem('w3storage-token', token)
}

/**
 * Removes any saved token from local storage
 */
export function deleteSavedToken() {
  localStorage.removeItem('w3storage-token')
}

/**
 * Hides the given DOM element by applying a "hidden" class,
 * which sets 'display: none'
 * @param {HTMLElement} el 
 */
export function hideElement(el) {
  el.classList.add('hidden')
}

/**
 * Removes the 'hidden' class from the given DOM element.
 * @param {HTMLElement} el 
 */
export function showElement(el) {
  el.classList.remove('hidden')
}

/**
 * @returns {string} location.hash, with the leading '#' removed
 */
export function getLocationHash() {
  return location.hash.substring(1)
}

/**
 * @param {string} value value you want to set location.hash to (without the leading '#')
 */
export function setLocationHash(value) {
  location.hash = '#' + value
}

/**
 * Makes a link to view the image via the IPFS gateway.
 * @param {string} url 
 * @returns {HTMLAnchorElement}
 */
export function makeShareLink(url) {
  const a = document.createElement('a')
  a.target = '_external'
  a.className = 'share-link'
  a.href = url
  
  const label = iconLabel('fontawesome-share', 'View on IPFS')
  a.appendChild(label)
  return a
}

/**
 * Makes a button that can be clicked to copy the given URL to the clipboard.
 * Also shows a popup message to the user when clicked.
 * @param {string} url 
 * @returns {HTMLButtonElement}
 */
export function makeClipboardButton(url) {
  const button = document.createElement('button')
  button.onclick = e => {
    e.preventDefault()
    copyStringToClipboard(url)
    showPopupMessage('Copied image URL to clipboard')
  }

  const label = iconLabel('fontawesome-paste', 'Copy sharing link')
  button.appendChild(label)
  return button
}

/**
 * Copies the given string to the user's clipboard.
 * @param {string} str 
 */
export function copyStringToClipboard (str) {
  // Create new element
  var el = document.createElement('textarea');
  // Set value (string to be copied)
  el.value = str;
  // Set non-editable to avoid focus and move outside of view
  el.setAttribute('readonly', '');
  el.style = {position: 'absolute', left: '-9999px'};
  document.body.appendChild(el);
  // Select text inside element
  el.select();
  // Copy text to clipboard
  document.execCommand('copy');
  // Remove temporary element
  document.body.removeChild(el);
}

/**
 * Shows a message to the user in a small popup box that fades away after a few seconds.
 * @param {string} message message to display
 */
export function showPopupMessage(message) {
  const snackbar = document.getElementById('snackbar')
  if (!snackbar) {
    return
  }
  snackbar.textContent = message
  snackbar.classList.add('show')
  setTimeout(() => snackbar.classList.remove('show'), 3000)
}
