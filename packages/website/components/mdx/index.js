import React from 'react'
import { MDXRemote } from 'next-mdx-remote'
import CodeBlock from './CodeBlock'
import CodeSnippet from './CodeSnippet'

/**
 * @typedef {object} MDXRemoteProps
 * @property {string} compiledSource
 * @property {object} [scope]
 * @property {object} [components]
 * 
 * @typedef {object} MDXProps
 * @property {MDXRemoteProps} mdx
 * @property {object} [frontmatter]
 * @property {string} [raw]
 */

/**
 * Renders compiled mdx source, as prepared by 
 * @param {MDXProps} props 
 */
export function MDX(props) {
  const { mdx } = props
  mdx.components = mdx.components || {}
  mdx.components.CodeSnippet = CodeSnippet
  // @ts-ignore
  mdx.components.code = function hackCode(_props) {
    console.log('monkey patch, yo', _props)
    if (!_props.className || !_props.className.startsWith('language')) {
      return <code {..._props} />
    }

    const lang = _props.className.replace('language-', '')
    return <CodeBlock lang={lang} {..._props} />
  }
  // @ts-ignore
  return <MDXRemote {...mdx} />
}