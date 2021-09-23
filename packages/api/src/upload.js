/* eslint-env serviceworker, browser */
import { packToBlob } from 'ipfs-car/pack/blob'
import { handleCarUpload } from './car.js'
import { toFormData } from './utils/form-data.js'

/**
 * Post a File/Directory.
 *
 * @param {import('./user').AuthenticatedRequest} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function uploadPost (request, env, ctx) {
  const { headers } = request
  const contentType = headers.get('content-type') || ''

  let name = headers.get('x-name')
  if (!name || typeof name !== 'string') {
    name = `Upload at ${new Date().toISOString()}`
  }

  let input
  if (contentType.includes('multipart/form-data')) {
    const form = await toFormData(request)
    const files = form.getAll('file')
    input = files.map((f) => ({
      path: f.name,
      content: f.stream()
    }))
  } else if (contentType.includes('application/car')) {
    throw new HTTPError('Please POST Content-addressed Archives to /car', 400)
  } else {
    const blob = await request.blob()
    if (blob.size === 0) {
      throw new Error('Empty payload')
    }
    input = [blob]
  }
  // TODO: do we want to wrap file uploads like we do car uploads from the client?
  // this path used to send the files to cluster and we didn't wrap, so we dont here for consistency with the old ways.
  const { car } = await packToBlob({ input, wrapWithDirectory: false })

  // NOTE: this is tracked in the db to allow us to query for content that was uploaded as raw files vs as CARs.
  const uploadType = 'Upload'
  return handleCarUpload(request, env, ctx, car, uploadType)
}
