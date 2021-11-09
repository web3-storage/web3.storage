import React from 'react'
import CodeBlock from '@theme/CodeBlock'

export default function CodeSnippet(props) {
  const { src, region, lang, ...codeBlockProps } = props
  if (lang) {
    codeBlockProps.className = `language-${lang}`
  }
  return (
    <CodeBlock {...codeBlockProps}>
      {extractRegion(src, region)}
    </CodeBlock>
  )
}

function extractRegion(src, regionName) {
  if (!regionName) {
    return src
  }

  const startPattern = new RegExp(`\/\/\\s*#region\\s+${regionName}`)
  const endPattern = new RegExp(`\/\/\\s*#endregion\\s+${regionName}`)
  const lines = src.split(/\r?\n/)
  const regionLines = []
  let found = false
  for (const line of lines) {
    if (!found) {
      if (line.match(startPattern)) {
        found = true
      }
      continue
    }
    if (line.match(endPattern)) {
      break
    }
    regionLines.push(line)
  }
  if (!found) {
    console.warn(`No region matching ${regionName} found in CodeSnippet src`)
  }
  return regionLines.join('\n')
}
