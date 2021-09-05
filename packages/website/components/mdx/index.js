import React from 'react'
import { MDXRemote } from 'next-mdx-remote'
import CodeBlock from './CodeBlock'
import CodeSnippet from './CodeSnippet'
import 'remark-admonitions/styles/classic.css'

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
  mdx.components = {
    CodeSnippet,
    pre: swizzlePreElement,
  }
  return <MDXRemote {...mdx} />
}

function swizzlePreElement(props) {
  const { children, rest } = props
  if (React.Children.count(children) !== 1) {
    return <pre {...props} />
  }
  const child = React.Children.only(children)
  if (!child.props.className.startsWith('language')) {
    return <pre {...props} />
  }
  const lang = child.props.className.replace('language-', '')
  return <CodeBlock lang={lang} metastring={child.props.metastring} {...rest}>
      {child}
    </CodeBlock>
}