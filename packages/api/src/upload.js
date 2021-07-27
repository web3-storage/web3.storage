/* eslint-env serviceworker */
import { gql } from '@web3-storage/db'
import { JSONResponse } from './utils/json-response.js'
import { toFormData } from './utils/form-data.js'
import { LOCAL_ADD_THRESHOLD } from './constants.js'
import { toPinStatusEnum } from './utils/pin.js'

const CREATE_UPLOAD = gql`
  mutation CreateUpload($data: CreateUploadInput!) {
    createUpload(data: $data) {
      _id
    }
  }
`

/**
 * Post a File/Directory.
 *
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 */
export async function uploadPost (request, env) {
  const { user, authToken } = request.auth
  const { headers } = request
  const contentType = headers.get('content-type') || ''

  let cid
  let dagSize
  let name = headers.get('x-name')
  let type
  if (!name || typeof name !== 'string') {
    name = `Upload at ${new Date().toISOString()}`
  }

  if (contentType.includes('multipart/form-data')) {
    const form = await toFormData(request)
    const files = /** @type {File[]} */ (form.getAll('file'))
    const dirSize = files.reduce((total, f) => total + f.size, 0)

    const entries = await env.cluster.addDirectory(files, {
      metadata: { size: dirSize.toString() },
      // When >2.5MB, use local add, because waiting for blocks to be sent to
      // other cluster nodes can take a long time. Replication to other nodes
      // will be done async by bitswap instead.
      local: dirSize > LOCAL_ADD_THRESHOLD
    })
    const dir = entries[entries.length - 1]

    cid = dir.cid
    dagSize = dir.size
    type = 'Multipart'
  } else {
    const blob = await request.blob()
    if (blob.size === 0) {
      throw new Error('Empty payload')
    }

    const entry = await env.cluster.add(blob, {
      metadata: { size: blob.size.toString() },
      // When >2.5MB, use local add, because waiting for blocks to be sent to
      // other cluster nodes can take a long time. Replication to other nodes
      // will be done async by bitswap instead.
      local: blob.size > LOCAL_ADD_THRESHOLD
    })

    cid = entry.cid
    dagSize = entry.size
    type = 'Blob'
  }

  // Retrieve current pin status and info about the nodes pinning the content.
  const { peerMap } = await env.cluster.status(cid)
  const pins = Object.entries(peerMap).map(([peerId, { peerName, status }]) => ({
    status: toPinStatusEnum(status),
    location: { peerId, peerName }
  }))

  if (!pins.length) { // should not happen
    throw new Error('not pinning on any node')
  }

  // Store in DB
  await env.db.query(CREATE_UPLOAD, {
    data: {
      user: user._id,
      authToken: authToken?._id,
      cid,
      name,
      type,
      pins,
      dagSize,
      chunkSize: dagSize
    }
  })

  return new JSONResponse({ cid })
}
