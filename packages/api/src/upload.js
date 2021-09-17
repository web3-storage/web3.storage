/* eslint-env serviceworker */
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

  let files = []
  if (contentType.includes('multipart/form-data')) {
    const form = await toFormData(request)
    files = form.getAll('file')
  } else if (contentType.includes('application/car')) {
    throw new Error('Please POST Content-addressed Archives to /car')
  } else {
    const blob = await request.blob()
    if (blob.size === 0) {
      throw new Error('Empty payload')
    }
    files.push(blob)
  }

  const { car } = await packToBlob({ input: files })
  return handleCarUpload(request, env, ctx, car)
}
