import fauna from 'faunadb'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const main = async () => {
  if (!process.env.FAUNA_KEY) {
    throw new Error('missing FAUNA_KEY environment variable')
  }
  await uploadResources('function')
  await uploadResources('index')
}

/**
 * @param {'function'|'index'} type
 */
const uploadResources = async type => {
  const __dirname = path.dirname(new URL(import.meta.url).pathname)
  const base = path.resolve(__dirname, '..', 'fauna', 'resources', type[0].toUpperCase() + type.slice(1))
  console.log(`💿 Reading FaunaQL resources from ${base}`)
  const client = new fauna.Client({ secret: process.env.FAUNA_KEY })
  const files = await fs.readdir(base)
  for (const file of files) {
    if (file.startsWith('.')) continue
    const expr = await import(path.join(base, file))
    console.log(`🛠 Uploading ${type} ${file.split('.')[0]}`)
    await client.query(expr, {})
  }
  console.log(`🎉 FaunaQL ${type} import succeeded`)
}

main()
