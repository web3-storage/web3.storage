import React from 'react'

import CodeBlock from './CodeBlock'

export default function CodeSnippet(props) {
  const { src, ...codeBlockProps } = props
  return <div>
    <CodeBlock {...codeBlockProps} >
      {src}
    </CodeBlock>
  </div>
}
