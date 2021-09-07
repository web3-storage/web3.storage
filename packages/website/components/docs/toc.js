import React from 'react'
import parseHtml from 'html-react-parser'

/**
 * 
 * @param {object} props
 * @param {string|undefined} props.toc
 * @returns {React.ReactElement}
 */
export default function TOC({ toc }) {
  if (!toc) {
    return <div />
  }
  // @ts-ignore
  return parseHtml(toc)
}
