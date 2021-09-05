import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import fs from 'fs/promises'
import path from 'path'
import slug from 'rehype-slug'

/**
 * 
 * @param {string} filepath 
 * @returns {Promise<string>}
 */
async function slurp(filepath) {
  console.log('loading from ', process.cwd(), filepath)
  const fullPath = path.join(process.cwd(), filepath)
  return fs.readFile(fullPath, 'utf8')
}

export async function serializeMDX(mdxSource) {
  const { content: raw, data: frontmatter } = matter(mdxSource)

  if (frontmatter.snippets) {
    const snippets = {}
    for (const [key, filename] of Object.entries(frontmatter.snippets)) {
      if (typeof filename !== 'string') {
        continue
      }
      const src = await slurp(filename)
      const lang = path.extname(filename).replace('.', '')
      snippets[key] = { src, filename, lang }
    }
    frontmatter.snippets = snippets
  }

  const mdxOptions = {
    rehypePlugins: [
      slug,
    ]
  }
  const mdx = await serialize(raw, { scope: frontmatter, mdxOptions })

  return {
    frontmatter,
    raw,
    mdx,
  }
}

/**
 * 
 * @param {string} mdxFilePath 
 * @returns 
 */
export async function loadMDX(mdxFilePath) {
  const fullContent = await slurp(mdxFilePath)
  return serializeMDX(fullContent)
}