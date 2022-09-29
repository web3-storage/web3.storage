/**
 * This script will generate many uploads for a given user token using the web3.storage API endpoints.
 * Handy when working with and testing features that require a pristine mass set of data, such as pagination.
 * Arguments can be passed with a arg=value pattern, ie token='<YOUR TOKEN HERE>'. Passing a token is the only required argument.
 * Not passing a value will default to a truthy value. ie appending `pin` argument is the same as `pin=true`.
 * This script requires a users token to be passed or assigned to an environment variable API_TOKEN.
 * Passable arguments are:
 * - token: the token of the user these uploads will be authenticated with.
 * - uploads: The amount of uploads that need to be added, defaulting to 25.
 * - url: The URL of the API, defaulting to localhost.
 * - psa_pin_requests: If true, on top of uploading the file, a PSA pin request is created for the given CID.
 * Example usage.
 * From the API folder, run the following command using a generated token.
 * - node scripts/generate-upload-data.js token='yourApiToken'
 * This will generate 25 uploads for the given user. Append the pin argument if these uploads should also be pinned.
 */

import fetch, { Blob } from '@web-std/fetch'

const requiredArgs = [
  'token'
]

const optionalArgs = {
  uploads: '25',
  psa_pin_requests: false,
  url: 'http://127.0.0.1:8787'
}

const argv = process.argv.slice(2).map((arg) => [
  arg.includes('=')
    ? arg.split('=')[0]
    : arg,
  !arg.includes('=') || arg.split('=')[1]
])

const parsedArgs = Object.fromEntries(argv)

if (!parsedArgs.token && process.env.API_TOKEN) {
  parsedArgs.token = process.env.API_TOKEN
}

if (!parsedArgs.token) {
  throw Error('Token required, set a token by appending `token=123` to this script')
}

Object.keys(parsedArgs).forEach(arg => {
  if (![...requiredArgs, ...Object.keys(optionalArgs)].includes(arg)) {
    throw Error(`Argument ${arg} is not recognized, accepted arguments are [${[...requiredArgs, ...Object.keys(optionalArgs)]}]`)
  }
})

const config = {
  ...optionalArgs,
  ...parsedArgs
}

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.token}`
  }
}

async function generateData () {
  let i = 0
  while (i < config.uploads) {
    const file = new Blob([`Automated file upload number ${i} id: ${Date.now()}`])

    const response = await fetch(
      new URL('/upload', `${config.url}`).toString(),
      {
        ...options,
        body: file
      }
    )
    const responseData = await response.json()
    const cid = responseData.cid

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}. Body: ${JSON.stringify(responseData)}`)
    }

    if (config.psa_pin_requests) {
      const body = {
        cid
      }
      const pinResponse = await fetch(
        new URL('/pins', `${config.url}`).toString(),
        {
          ...options,
          body: JSON.stringify(body)
        }
      )

      const pinResponseData = await pinResponse.json()

      if (!pinResponse.ok) {
        console.error(`HTTP error! Status: ${pinResponse.status}. Body: ${JSON.stringify(pinResponseData)}`)
      }
    }
    i++
  }
  console.log(`Done, uploaded ${i} files ${config.psa_pin_requests ? 'pinning each of them' : ''}.`)
}

generateData()
