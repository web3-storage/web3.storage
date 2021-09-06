import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import fs from 'fs/promises'
import path from 'path'
import remarkAdmonitions from 'remark-admonitions'
import rehypeSlug from 'rehype-slug'
import rehypeToc from '@jsdevtools/rehype-toc'

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
 * @typedef {object} SerializeMDXOptions
 * @property {boolean} [disableToc] if true, don't generate a table-of-contents
 */

/**
 * @param {string} mdxSource
 * 
 * @param {SerializeMDXOptions} [options]
 * @returns {Promise<object>}
 */
export async function serializeMDX(mdxSource, options = {}) {
  const { content: raw, data: frontmatter } = matter(mdxSource)
  const { disableToc } = options

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
      remarkAdmonitions,
      transformInternalLinks,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeToc, {
        headings: ['h2', 'h3'],
        position: 'beforeend',
        // @ts-ignore
        customizeTOC: toc => disableToc ? false : toc,
        cssClasses: {
          // TODO: take these as a param
          toc: 'toc hidden md:block h-screen sticky top-0 p-10'
        }
      }]
    ]
  }

  const src = ['<main class="mdx-main prose max-w-2xl">', raw, '</main>'].join('\n\n')

  const mdx = await serialize(src, { 
    scope: frontmatter,
    // @ts-ignore
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
 * @param {SerializeMDXOptions} [options]
 * @returns 
 */
export async function loadMDX(mdxFilePath, options = {}) {
  const fullContent = await slurp(mdxFilePath)
  return serializeMDX(fullContent, options)
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
    const rewriteLinks = node => {
      if (!node.url || node.url.match(/^https?:/)) {
        return
      }
      let url = node.url.replace(/\.mdx?/, '/')

      // hack to deal with the fact that the rendered site puts
      // docs one level deeper in the path hierarchy than the sources
      // e.g. /foo/bar.md becomes /foo/bar/index.html
      // so we need to drop down an extra level to make things resolve
      if (url.startsWith('./')) {
        url = '.' + url
      } else if (url.startsWith('../')) {
        url = '../' + url
      }
      // console.log(`changing url from '${node.url}' to '${url}'`)
      node.url = url
    }

    visit(tree, 'link', rewriteLinks)
    visit(tree, 'definition', rewriteLinks)

    done()
  }
}