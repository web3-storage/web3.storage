
// #region getFiles
function getFiles () {
  const fileInput = document.querySelector('input[type="file"]')
  return fileInput.files
}
// #endregion getFiles

// #region makeFileObjects
function makeFileObjects () {
  // You can create File objects from a Blob of binary data
  // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob
  // Here we're just storing a JSON object, but you can store images,
  // audio, or whatever you want!
  const obj = { hello: 'world' }
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })

  const files = [
    new File(['contents-of-file-1'], 'plain-utf8.txt'),
    new File([blob], 'hello.json')
  ]
  return files
}
// #endregion makeFileObjects
