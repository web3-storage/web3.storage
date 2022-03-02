// This file exists to workaround the fact that rehype plugins are published
// as ESM modules, but docusaurus.config.js can only require things.
//
// The attachPlugins function returns a wrapper rehype plugin that
// uses `await import` to load the actual plugins we want to apply, then
// calls the transformer function on them.

function attachPlugins() {
  return async function transformer(node, file) {
    const linkIconFile = process.cwd() + '/static/img/external-link.svg'
    const linkIcon = await loadSvg(linkIconFile)

    const { default: rehypeExternalLinks } = await import('rehype-external-links')
    const xform = rehypeExternalLinks({
      target: '_blank',
      content: linkIcon,
    })

    return xform(node, file)
  }
}


/**
 * Loads an SVG file and returns a hast AST, suitable for injecting into
 * the rehype-external-links plugin.
 * 
 * @param {string} filename path to a .svg file
 * @returns {Promise<import('hast').Element>} a hast AST for the SVG element
 */
async function loadSvg(filename) {
  if (_iconCache.has(filename)) {
    return _iconCache.get(filename)
  }

  const { default: unified } = await import('unified')
  const { default: parse } = await import('rehype-parse')
  const { read } = await import('to-vfile')
  const processor = unified().use(parse, { fragment: true, space: 'svg' })
  const file = await read(filename)
  const rootNode = processor.parse(file)
  for (const n of rootNode.children) {
    if (n.type === 'element' && n.tagName === 'svg') {
      _iconCache.set(filename, n)
      return n
    }
  }
}

const _iconCache = new Map()

module.exports = attachPlugins