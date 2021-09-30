import { JSONResponse } from './utils/json-response.js'

export function versionGet (request, env) {
  return new JSONResponse({
    release: env.RELEASE,
    version: env.VERSION,
    commit: env.COMMITHASH,
    branch: env.BRANCH
  })
}
