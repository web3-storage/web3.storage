import '../css/style.css'

import { storeImage } from './storage'
import { makeClipboardButton, showElement, hideElement, getSavedToken, navToSettings} from './helpers'


// keep track of currently selected file
let selectedFile = null

/**
 * DOM initialization for upload UI.
 */
function setupUploadUI() {
  if (!document.getElementById('upload-ui')) {
    return
  }
  const uploadButton = document.getElementById('upload-button')
  const fileInput = document.getElementById('file-input')
  const dropArea = document.getElementById('drop-area')

  showUploadInputs()

  // handle file selection changes
  fileInput.onchange = fileSelected

  // handle upload button clicks
  uploadButton.onclick = uploadClicked

  // apply highlight class when user drags over the drop-area div
  for (const eventName of ['dragenter', 'dragover']) {
    const highlight = e => {
      e.preventDefault()
      dropArea.classList.add('highlight')
    }
    dropArea.addEventListener(eventName, highlight, false)
  }

  // remove highlight class on drag exit
  for (const eventName of ['dragleave', 'drop']) {
    const unhighlight = e => {
      e.preventDefault()
      dropArea.classList.remove('highlight')
    }
    dropArea.addEventListener(eventName, unhighlight, false)
  }

  // handle dropped files
  dropArea.addEventListener('drop', fileDropped, false)
}

/**
 * Callback for file input onchange event, fired when the user makes a file selection.
 */
function fileSelected(e) {
  if (e.target.files.length < 1) {
    console.log('nothing selected')
    return
  }
  handleFileSelected(e.target.files[0])
}

/**
 * Callback for 'drop' event that fires when user drops a file onto the drop-area div.
 */
function fileDropped(evt) {
  evt.preventDefault()
  
  // filter out any non-image files
  const files = [...evt.dataTransfer.files].filter(f => f.type.includes('image'))
  if (files.length < 1) {
    console.log('drop handler recieved no image files, ignoring drop event')
    return
  }
  handleFileSelected(files[0])
}

/**
 * Respond to file selection, whether through drag-and-drop or manual selection.
 * Side effects: sets preview image to file content and sets upload button state to enabled.
 */
function handleFileSelected(file) {
  const uploadButton = document.getElementById('upload-button')
  selectedFile = file
  if (file == null) {
    uploadButton.disabled = true
    return
  }
  updatePreviewImages(file)
  uploadButton.disabled = false
}

/**
 * Sets the src for any preview image elements to the content of the given image file.
 * @param {File} imageFile 
 */
function updatePreviewImages(imageFile) {
  const elements = document.querySelectorAll('img.preview-image')
  const url = URL.createObjectURL(imageFile)
  for (const img of elements) {
    img.src = url
  }
}

/**
 * Callback for upload button's onclick event. Calls storeImage with user selected file and caption text.
 * @param {Event} evt 
 * @returns 
 */
function uploadClicked(evt) {
  evt.preventDefault()
  if (selectedFile == null) {
    console.log('no file selected')
    return
  }

  // switch to "upload in progress" view
  showInProgressUI()

  const captionInput = document.getElementById('caption-input')
  const caption = captionInput.value || ''
  storeImage(selectedFile, caption)
    .then(showSuccessView)
}

/**
 * Shows the image upload form and hides the in-progress and success views.
 */
function showUploadInputs() {
  const inputArea = document.getElementById('upload-input-area')
  showElement(inputArea)
  hideInProgressView()
  hideSuccessView()
}

/**
 * Shows an "upload in progress" view and hides the image upload form and success view.
 */
function showInProgressUI() {
  const inProgress = document.getElementById('upload-in-progress')
  showElement(inProgress)
  hideUploadInputs()
  hideSuccessView()
}

/**
 * Shows a "yay! success" view for the given upload result.
 * @param {StoreImageResult} uploadResult an object containing metdata about the uploaded file.
 */
function showSuccessView(uploadResult) {
  hideInProgressView()

  const galleryLink = document.getElementById('success-gallery-link')
  galleryLink.href = `./gallery.html#${uploadResult.cid}`

  const gatewayLink = document.getElementById('success-gateway-link')
  gatewayLink.href = uploadResult.imageGatewayURL

  const successView = document.getElementById('upload-success')
  const copyButton = makeClipboardButton(uploadResult.imageGatewayURL)
  successView.appendChild(copyButton)

  showElement(successView)
}

/**
 * Hides the image upload form.
 */
function hideUploadInputs() {
  const inputArea = document.getElementById('upload-input-area')
  hideElement(inputArea)
}

/**
 * Hides the upload-in-progress view.
 */
function hideInProgressView() {
  const inProgress = document.getElementById('upload-in-progress')
  hideElement(inProgress)
}

/**
 * Hides the upload success view.
 */
function hideSuccessView() {
  const successView = document.getElementById('upload-success')
  hideElement(successView)
}


/// init

if (!getSavedToken()) {
  navToSettings()
}
setupUploadUI()
