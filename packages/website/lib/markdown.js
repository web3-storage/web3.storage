import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import fs from 'fs/promises'
import path from 'path'
import remarkAdmonitions from 'remark-admonitions'
import rehypeSlug from 'rehype-slug'
import rehypeToc from '@jsdevtools/rehype-toc'
import { toHtml } from 'hast-util-to-html'


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
 * 
 * 
 * @typedef {import('next-mdx-remote').MDXRemoteSerializeResult} MDXRemoteSerializeResult
 * 
 * @typedef {object} SerializeMDXResult
 * @property {Record<string, any>} frontmatter
 * @property {string} raw
 * @property {string|undefined} toc
 * @property {MDXRemoteSerializeResult} mdx
 */

/**
 * @param {string} mdxSource
 * 
 * @param {SerializeMDXOptions} [options]
 * @returns {Promise<SerializeMDXResult>}
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

  let tocAst = null
  const mdxOptions = {
    remarkPlugins: [
      remarkAdmonitions,
      transformInternalLinks,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeToc, {
        headings: ['h2'],
        // @ts-ignore
        customizeTOC: toc => {
          tocAst = toc
          return false
        },
      }]
    ]
  }

  const mdx = await serialize(raw, { 
    scope: frontmatter,
    // @ts-ignore
    mdxOptions,
  })

  let toc
  if (tocAst && !disableToc) {
    toc = toHtml(tocAst)
  }

  return {
    frontmatter,
    raw,
    mdx,
    toc,
  }
}

/**
 * 
 * @param {string} mdxFilePath
 * @param {SerializeMDXOptions} [options]
 * @returns {Promise<SerializeMDXResult>}
 */
export async function loadMDX(mdxFilePath, options = {}) {
  const fullContent = await slurp(mdxFilePath)
  return serializeMDX(fullContent, options)
}


/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').Definition} Definition
 * @typedef {import('mdast').Image} Image
 */

function transformInternalLinks() {
  /**
   * @param {Node|Parent} node 
   * @param {string} type 
   * @param {function(Node):void} handler 
   */
  function visit(node, type, handler) {
    if (node.type === type) {
      handler(node)
    }
    if ('children' in node) {
      node.children.forEach(n => visit(n, type, handler))
    }
  }

  /**
   * @param {Parent} tree
   * @param {string} _file
   * @param {function} done
  */
  function transformer(tree, _file, done) {
    const rewriteLinks = (/** @type {Node|Link|Definition} */ node)=> {
      if (!('url' in node)) {
        return
      }
      if (!node.url.match(/^https?:/)) {
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

    visit(tree, 'image', (/** @type {Node|Image} */ node) => {
      if (!('url' in node)) {
        return
      }
      if (!node.url || node.url.match(/^https?:/)) {
        return
      }
      const url = node.url.replace(/^.*\/public\/images/, '/images')
      if (url !== node.url) {
        // console.log(`chaning image url from ${node.url} to ${url}`)
        node.url = url
      }
    })

    done()
  }

  return transformer
}