export function errCode (err, code) {
  return Object.assign(err, { code })
}
