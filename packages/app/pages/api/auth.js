import Cors from 'cors'
import { getMagic } from '../../lib/magic'

export default async function handler(req, res) {
  await new Promise((resolve, reject) => {
    Cors({ origin: '*' })
      (req, res, (result) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
  })

  res.status(200).json({ authenticated: getMagic().user.isLoggedIn() })
}
