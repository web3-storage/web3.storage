import { PutObjectCommand } from '@aws-sdk/client-s3'
import { sha256 } from 'multiformats/hashes/sha2'
import { toString } from 'uint8arrays'

/**
 * @param {Blob} content
 * @param {import('../env').Env} env
 */
export async function backup (content, env) {
  if (!env.s3Client) {
    return undefined
  }

  const data = await content.arrayBuffer()
  const key = await sha256.digest(new Uint8Array(data))
  const keyStr = toString(key.bytes, 'base32')
  const bucketParams = {
    Bucket: env.s3BucketName,
    Key: keyStr,
    Body: content
  }
  await env.s3Client.send(new PutObjectCommand(bucketParams))
  return keyStr
}
