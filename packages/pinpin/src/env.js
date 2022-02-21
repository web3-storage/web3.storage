
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function envConfig () {
  if (!process.env.ENV || process.env.ENV === 'DEV') {
    // use the .env from the root of the momorepo for dev.
    dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') })
  } else {
    dotenv.config()
  }
}
