import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import { onlyText } from 'react-children-utilities'

export default function CodeBlock(props) {
  const { lang } = props
  const src = onlyText(props.children)
  
  return (
    <Highlight {...defaultProps} code={src} language={lang}>
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        {tokens.map((line, i) => (
          <div {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
  )
}