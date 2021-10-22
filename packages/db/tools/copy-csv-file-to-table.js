import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const main = async () => {
  if (!process.env.PG_REST_URL) {
    throw new Error('missing PG_REST_URL environment variable')
  }

  if (!process.env.PG_REST_JWT) {
    throw new Error('missing PG_REST_JWT environment variable')
  }

  const input = process.argv[2]
  if (!fs.existsSync(input)) {
    throw new Error(`Could not open ${input}`)
  }

  await copyFile('function')
}

const copyFile = async () => {
  
}

main()
