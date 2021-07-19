import { Web3Storage } from 'web3.storage'

const endpoint = 'https://api.web3.storage' // the default
const token =
  new URLSearchParams(window.location.search).get('key') || 'API_KEY' // your API key from https://web3.storage/manage

const storage = new Web3Storage({ endpoint, token })

document.getElementById("filepicker").addEventListener("change", async function (event) {
  console.log('Using endpoint:', endpoint)

  let cidP = document.getElementById("cid")
  let files = event.target.files

  const cid = await storage.put(files)

  const text = document.createTextNode(`Content added with CID: ${cid}`)
  cidP.appendChild(text)
}, false)
