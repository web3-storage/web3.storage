import '@glidejs/glide/dist/css/glide.core.min.css'
import '@glidejs/glide/dist/css/glide.theme.min.css'
import '../css/style.css'

import Glide from '@glidejs/glide'

import { listImageMetadata } from './storage'
import { showElement, hideElement, setLocationHash, getLocationHash, makeClipboardButton, makeShareLink, getSavedToken } from './helpers'

////////////////////////////////////
///////// Gallery view
////////////////////////////////////

// #region gallery-view

/**
 * DOM initialization for gallery view.
 */
async function setupGalleryUI() {
  const carousel = document.getElementById('carousel')
  const spinner = document.getElementById('carousel-spinner')
  const slideContainer = document.getElementById('slide-container')
  if (!slideContainer) {
    return
  }

  const slideCIDs = []
  let selectedSlide = 0
  let i = 0
  for await (const image of listImageMetadata()) {
    slideCIDs[i] = image.cid
    const img = makeImageCard(image)
    const li = document.createElement('li')
    li.className = 'glide__slide'
    li.appendChild(img)
    slideContainer.appendChild(li)

    // if we have a location hash that matches this image's CID, start the carousel here
    if (image.cid === getLocationHash()) {
      selectedSlide = i
    }

    i += 1
  }

  console.log(`loaded metadata for ${i} images`)
  // If we don't have any images, show a message telling the user to upload something
  if (i == 0) {
    hideElement(spinner)
    const noContentMessage = document.getElementById('no-content-message')
    showElement(noContentMessage)
  } else {
    showElement(carousel)
    hideElement(spinner)
  }

  // make the carousel component
  const glide = new Glide('.glide', {
    type: 'carousel',
    gap: 800,
    startAt: selectedSlide,
  })

  // after moving to a new slide, update the location hash with the matching CID
  // and update the "image x of y" text
  glide.on('move.after', () => {
    setLocationHash(slideCIDs[glide.index])
    updateImageCount(glide.index + 1, slideCIDs.length)
  })

  glide.mount()

  // update the slide if the location hash changes
  // e.g. if the user preses the back button
  window.onhashchange = () => {
    const hash = getLocationHash()
    console.log('hash change', hash)
    // find the slide index for the CID
    for (let idx = 0; idx < slideCIDs.length; idx++) {
      if (slideCIDs[idx] === hash) {
        // only move if we're not already on the right slide
        if (glide.index !== idx) {
          glide.go(`=${idx}`)
        }
        break
      }
    }
  }
}

/**
 * Returns a DOM element for an image card in the gallery view.
 * @param {object} metadata
 * @returns {HTMLDivElement}
 */
function makeImageCard(metadata) {
  const wrapper = document.createElement('div')
  wrapper.className = 'gallery-image-card'

  const imgEl = document.createElement('img')
  imgEl.src = metadata.gatewayURL
  imgEl.alt = metadata.caption

  const label = document.createElement('span')
  label.className = 'gallery-image-caption'
  label.textContent = metadata.caption

  const shareLink = makeShareLink(metadata.gatewayURL)
  const copyButton = makeClipboardButton(metadata.gatewayURL)
  wrapper.appendChild(imgEl)
  wrapper.appendChild(label)
  wrapper.appendChild(shareLink)
  wrapper.appendChild(copyButton)
  return wrapper
}

function updateImageCount(current, total) {
  const div = document.getElementById('gallery-image-count')
  if (!div) {
    return
  }
  div.textContent = `Image ${current} of ${total}`
}

// #endregion gallery-view

////////////////////////////////
///////// Initialization
////////////////////////////////


// redirect to settings page if there's no API token in local storage
if (!getSavedToken()) {
  navToSettings()
}

setupGalleryUI()
