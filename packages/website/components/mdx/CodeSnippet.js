import React from 'react'
import CodeBlock from './CodeBlock'


/**
 * @typedef {object} CodeSnippetUniqueProps
 * @property {string} src
 * @property {string} [region] name of VSCode region to extract from source for display
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
  const {src, region, ...codeBlockProps} = props
  return <div>
    <CodeBlock {...codeBlockProps} >
      <div>
        {extractRegion(src, region)}
      </div>
    </CodeBlock>
  </div>
}

/**
 * 
 * @param {string} src 
 * @param {string|undefined} regionName 
 * @returns 
 */
function extractRegion(src, regionName) {
  if (!regionName) {
    return src
  }

  const startPattern = new RegExp(`//\\s*#region\\s+${regionName}`)
  const endPattern = new RegExp(`//\\s*#endregion\\s+${regionName}`)
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
