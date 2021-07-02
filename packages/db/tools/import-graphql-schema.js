import fs from 'fs'
import fetch from '@web-std/fetch'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const main = async () => {
  if (!process.env.FAUNA_KEY) {
    throw new Error('missing FAUNA_KEY environment variable')
  }
  await uploadSchema()
}

const uploadSchema = async () => {
  const url = new URL('../fauna/schema.graphql', import.meta.url)
  console.log(`💿 Reading GraphQL Schema from ${url}`)
  const content = await fs.promises.readFile(url)
  console.log('🏗 Uploading GraphQL Schema to be merged into Fauna DB')
  const response = await fetch('https://graphql.fauna.com/import', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.FAUNA_KEY}` },
    body: content
  })
  if (!response.ok) {
    const reason = await response.text()
    throw new Error(`failed to import schema: ${response.status} ${reason}`)
  }
  console.log('🎉 GraphQL schema import succeeded')
}

main()
