import fauna from 'faunadb'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const main = async () => {
  if (!process.env.FAUNA_KEY) {
    throw new Error(`missing FAUNA_KEY environment variable`)
  }
  await uploadFunctions()
}

const uploadFunctions = async () => {
  const __dirname = path.dirname(new URL(import.meta.url).pathname)
  const base = path.resolve(__dirname, '..', 'fauna', 'resources', 'Function')
  console.log(`💿 Reading FaunaQL functions from ${base}`)
  const client = new fauna.Client({ secret: process.env.FAUNA_KEY })
  const files = await fs.readdir(base)
  for (const file of files) {
    const expr = await import(path.join(base, file))
    console.log(`🛠 Uploading function ${file.split('.')[0]}`)
    await client.query(expr, {})
  }
  console.log('🎉 FaunaQL functions import succeeded')
}

main()
