import React from 'react'

import CodeBlock from './CodeBlock'


/**
 * @typedef {object} CodeSnippetUniqueProps
 * @property {React.ReactChildren} src
 * 
 * @typedef {import('./CodeBlock').CodeBlockProps} CodeBlockProps
 * @typedef {CodeBlockProps & CodeSnippetUniqueProps} CodeSnippetProps
 */

/**
 * 
 * @param {CodeSnippetProps} props 
 * @returns 
 */
export default function CodeSnippet(props) {
  const { src, ...codeBlockProps } = props
  return <div>
    <CodeBlock {...codeBlockProps} >
      {src}
    </CodeBlock>
  </div>
}
