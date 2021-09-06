import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import fs from 'fs/promises'
import path from 'path'
import admonitions from 'remark-admonitions'
import slug from 'rehype-slug'

/**
 * 
 * @param {string} filepath 
 * @returns {Promise<string>}
 */
async function slurp(filepath) {
  const fullPath = path.join(process.cwd(), filepath)
  return fs.readFile(fullPath, 'utf8')
}

/**
 * @param {string} mdxSource
 * @returns {Promise<object>}
 */
export async function serializeMDX(mdxSource) {
  const { content: raw, data: frontmatter } = matter(mdxSource)

  if (frontmatter.snippets) {
    const snippets = {...frontmatter.snippets}
    for (const [key, filename] of Object.entries(frontmatter.snippets)) {
      if (typeof filename !== 'string') {
        continue
      }
      console.log(`loading snippet ${key} from ${filename}`)
      const src = await slurp(filename)
      const lang = path.extname(filename).replace('.', '')
      snippets[key] = { src, filename, lang }
    }
    frontmatter.snippets = snippets
  }

  const mdxOptions = {
    remarkPlugins: [
      admonitions,
      transformInternalLinks,
    ],
    rehypePlugins: [
      slug,
    ]
  }

  const mdx = await serialize(raw, { 
    scope: frontmatter, 
    mdxOptions,
  })

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

function transformInternalLinks() {
  function visit(node, type, handler) {
    if (node.type === type) {
      handler(node)
    }
    if (node.children) {
      node.children.forEach(n => visit(n, type, handler))
    }
  }

  return function transformer(tree, file, done) {
    visit(tree, 'link', node => {
      if (!node.url || node.url.match(/^https?:/)) {
        return
      }
      const url = node.url.replace(/\.mdx?/, '/')
      // console.log(`changing url from '${node.url}' to '${url}'`)
      node.url = url
    })

    done()
  }
}