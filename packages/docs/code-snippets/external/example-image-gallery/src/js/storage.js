import { Web3Storage } from 'web3.storage'

import { showMessage, showLink, jsonFile, getSavedToken, makeGatewayURL } from './helpers'

////////////////////////////////
////// Image upload & listing
////////////////////////////////

// #region storeImage

// We use this to identify our uploads in the client.list response.
const namePrefix = 'ImageGallery'

/**
 * Stores an image file on Web3.Storage, along with a small metadata.json that includes a caption & filename.
 * @param {File} imageFile a File object containing image data
 * @param {string} caption a string that describes the image
 * 
 * @typedef StoreImageResult
 * @property {string} cid the Content ID for an directory containing the image and metadata
 * @property {string} imageURI an ipfs:// URI for the image file
 * @property {string} metadataURI an ipfs:// URI for the metadata file
 * @property {string} imageGatewayURL an HTTP gateway URL for the image
 * @property {string} metadataGatewayURL an HTTP gateway URL for the metadata file
 * 
 * @returns {Promise<StoreImageResult>} an object containing links to the uploaded content
 */
export async function storeImage(imageFile, caption) {
  // The name for our upload includes a prefix we can use to identify our files later
  const uploadName = [namePrefix, caption].join('|')

  // We store some metadata about the image alongside the image file.
  // The metadata includes the file path, which we can use to generate 
  // a URL to the full image.
  const metadataFile = jsonFile('metadata.json', {
    path: imageFile.name,
    caption
  })

  const token = getSavedToken()
  if (!token) {
    showMessage('> ❗️ no API token found for Web3.Storage. You can add one in the settings page!')
    showLink(`${location.protocol}//${location.host}/settings.html`)
    return
  }
  const web3storage = new Web3Storage({ token })
  showMessage(`> 🤖 calculating content ID for ${imageFile.name}`)
  const cid = await web3storage.put([imageFile, metadataFile], {
    // the name is viewable at https://web3.storage/files and is included in the status and list API responses
    name: uploadName,

    // onRootCidReady will be called as soon as we've calculated the Content ID locally, before uploading
    onRootCidReady: (localCid) => {
      showMessage(`> 🔑 locally calculated Content ID: ${localCid} `)
      showMessage('> 📡 sending files to web3.storage ')
    },

    // onStoredChunk is called after each chunk of data is uploaded
    onStoredChunk: (bytes) => showMessage(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`)
  })

  const metadataGatewayURL = makeGatewayURL(cid, 'metadata.json')
  const imageGatewayURL = makeGatewayURL(cid, imageFile.name)
  const imageURI = `ipfs://${cid}/${imageFile.name}`
  const metadataURI = `ipfs://${cid}/metadata.json`
  return { cid, metadataGatewayURL, imageGatewayURL, imageURI, metadataURI }
}

//#endregion storeImage

//#region listImageMetadata
/**
 * Get metadata objects for each image stored in the gallery.
 * 
 * @returns {AsyncIterator<ImageMetadata>} an async iterator that will yield an ImageMetadata object for each stored image.
 */
export async function* listImageMetadata() {
  const token = getSavedToken()
  if (!token) {
    console.error('No API token for Web3.Storage found.')
    return
  }

  const web3storage = new Web3Storage({ token })
  for await (const upload of web3storage.list()) {
    if (!upload.name || !upload.name.startsWith(namePrefix)) {
      continue
    }

    try {
      const metadata = await getImageMetadata(upload.cid)
      yield metadata
    } catch (e) {
      console.error('error getting image metadata:', e)
      continue
    }
  }
}
//#endregion listImageMetadata

//#region getImageMetadata
/**
 * Fetches the metadata JSON from an image upload.
 * @param {string} cid the CID for the IPFS directory containing the metadata & image
 * 
 * @typedef {object} ImageMetadata
 * @property {string} cid the root cid of the IPFS directory containing the image & metadata
 * @property {string} path the path within the IPFS directory to the image file
 * @property {string} caption a user-provided caption for the image
 * @property {string} gatewayURL an IPFS gateway url for the image
 * @property {string} uri an IPFS uri for the image
 * 
 * @returns {Promise<ImageMetadata>} a promise that resolves to a metadata object for the image
 */
export async function getImageMetadata(cid) {
  const url = makeGatewayURL(cid, 'metadata.json')
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`error fetching image metadata: [${res.status}] ${res.statusText}`)
  }
  const metadata = await res.json()
  const gatewayURL = makeGatewayURL(cid, metadata.path)
  const uri = `ipfs://${cid}/${metadata.path}`
  return { ...metadata, cid, gatewayURL, uri }
}
//#endregion getImageMetadata

//#region validateToken
/**
 * Checks if the given API token is valid by issuing a request.
 * @param {string} token 
 * @returns {Promise<boolean>} resolves to true if the token is valid, false if invalid.
 */
export async function validateToken(token) {
  console.log('validating token',token)
  const web3storage = new Web3Storage({ token })

  try {
    for await (const _ of web3storage.list({ maxResults: 1})) {
      // any non-error response means the token is legit
      break
    }
    return true
  } catch (e) {
    // only return false for auth-related errors
    if (e.message.includes('401') || e.message.includes('403')) {
      console.log('invalid token', e.message)
      return false
    }
    // propagate non-auth errors
    throw e
  }
}
// #endregion validateToken
