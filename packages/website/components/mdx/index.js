import React from 'react'
import { MDXRemote } from 'next-mdx-remote'
import CodeBlock from './CodeBlock'
import CodeSnippet from './CodeSnippet'
import Tabs from './Tabs'
import TabItem from './TabItem'
import 'remark-admonitions/styles/classic.css'

/**
 * @typedef {import('react').ReactNode} ReactNode
 * 
 * @typedef {object} MDXRemoteProps
 * @property {string} compiledSource
 * @property {Record<string, any>} [scope]
 * @property {Record<string, ReactNode>} [components]
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
  const { mdx: { compiledSource, scope, components: userComponents } } = props
  const components = {
    CodeBlock,
    CodeSnippet,
    Tabs,
    TabItem,
    pre: swizzlePreElement,
    ...userComponents,
  }
  return <MDXRemote 
    compiledSource={compiledSource} 
    scope={scope} 
    components={components} />
}

/**
 * 
 * @param {any} props 
 * @returns 
 */

function swizzlePreElement(props) {
  const { children, rest } = props
  if (React.Children.count(children) !== 1) {
    return <pre {...props} />
  }
  const child = React.Children.only(children)
  if (!child.props.className || !child.props.className.startsWith('language')) {
    return <pre {...props} />
  }
  const lang = child.props.className.replace('language-', '')
  return <CodeBlock lang={lang} metastring={child.props.metastring} {...rest}>
      {child}
    </CodeBlock>
}