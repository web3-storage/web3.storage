import React from 'react'

import CodeBlock from './CodeBlock'

export default function CodeSnippet(props) {
  console.log(props)
  const { src, lang } = props
  return <CodeBlock lang={lang} >{src}</CodeBlock>
}