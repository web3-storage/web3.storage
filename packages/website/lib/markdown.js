import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'

export async function loadMDX(mdxFilePath) {
  const fs = await import('fs/promises')
  const path = await import('path')
  const filepath = path.join(process.cwd(), mdxFilePath)
  const content = await fs.readFile(filepath, 'utf8')
  const m = matter(content)
  const mdx = await serialize(m.content, { scope: m.data })
  return {
    frontmatter: m.data,
    raw: m.content,
    mdx,
  }
}