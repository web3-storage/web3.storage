import '../css/style.css'

import { validateToken } from './storage'
import { hideElement, showElement, saveToken, getSavedToken, deleteSavedToken, showPopupMessage } from './helpers'

////////////////////////////////////
///////// Token input view
////////////////////////////////////

// #region token-view

/**
 * DOM initialization for token management UI.
 */
function setupTokenUI() {  
  if (!document.getElementById('token-ui')) {
    return
  }

  const tokenInputArea = document.getElementById('token-input-wrapper')
  const tokenInput = document.getElementById('token-input')
  const tokenSpinner = document.getElementById('token-spinner')

  const changeHandler = evt => {
    let token
    if (evt.type === 'paste' && evt.clipboardData) {
      token = evt.clipboardData.getData('Text')
    } else {
      token = evt.target.value
    }
    if (!token) {
      return
    }

    hideElement(tokenInputArea)
    showElement(tokenSpinner)

    validateToken(token).then(valid => {
      hideElement(tokenSpinner)
      if (!valid) {
        showPopupMessage('Invalid token!')
        tokenInput.value = ''
        updateTokenUI()
        return
      }
      saveToken(token)
      updateTokenUI()
    })
  }

  tokenInput.onchange = changeHandler
  tokenInput.onpaste = changeHandler

  const tokenDeleteButton = document.getElementById('token-delete-button')
  if (tokenDeleteButton) {
    tokenDeleteButton.onclick = evt => {
      evt.preventDefault()
      deleteSavedToken()
      updateTokenUI()
    }
  }
  const tokenSaveButton = document.getElementById('token-save-button')
  tokenSaveButton.onclick = evt => {
    evt.preventDefault()
    // the save button doesn't actually do anything, 
    // since we already handle the token input in the text field's
    // onchange handler, which will fire when you try to click the button :)
  }

  updateTokenUI()
}

/**
 * Update the token UI to show the input box if we don't have a saved token, 
 * or the delete button if we do.
 */
function updateTokenUI() {
  const tokenEntrySection = document.getElementById('token-input-wrapper')
  const savedTokenSection = document.getElementById('saved-token-wrapper')
  const token = getSavedToken()
  if (token) {
    const savedTokenInput = document.getElementById('saved-token')
    savedTokenInput.value = token
    hideElement(tokenEntrySection)
    showElement(savedTokenSection)
  } else {
    showElement(tokenEntrySection)
    hideElement(savedTokenSection)
  }
}

// #endregion token-view

////////////////////////////////
///////// Initialization
////////////////////////////////

// #region init

setupTokenUI()

// #endregion init