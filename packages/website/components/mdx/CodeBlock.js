import React from "react";
import clsx from 'clsx';
import { CopyToClipboard } from "react-copy-to-clipboard"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Highlight, { defaultProps } from "prism-react-renderer"
import { onlyText } from 'react-children-utilities'
import yaml from 'js-yaml'

/**
 * @typedef {object} CodeBlockProps
 * @property {string} [lang] language to use for syntax highlighting
 * @property {string} [metastring] additional meta info attached to markdown code block. If present, will be parsed and merged into the code block props. {@see parseMetastring} for parsing rules.
 * @property {string} [title] if present, code block will be rendered with a title at the top.
 * @property {boolean} [copyEnabled] whether to show a copy-to-clipboard button. defaults to true if left undefined.
 * @property {React.Children} children the text content of all child nodes will be used as the source to display inside the code block
 */

/**
 * 
 * @param {CodeBlockProps} props 
 * @returns 
 */
export default function CodeBlock(props) {
  const { lang, metastring } = props
  const src = onlyText(props.children)

  const meta = parseMetastring(metastring)
  const mergedProps = {...props, ...meta}
  const { copyEnabled, title } = mergedProps
  const copyButton = copyEnabled === false ? <div/> : CopyButton({src})

  return (
    <div className='codeBlockWrapper bg-gray-300 rounded-md' >
      <Highlight {...defaultProps} code={src} language={lang}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <div>
          <div className={clsx(className, 'rounded-md')} style={style}>
          {titleView(title)}
            <div className='relative'>
            <pre >
              {tokens.map((line, i) => (
                <div {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
            {copyButton}
            </div>
        </div>
      </div>
      )}
    </Highlight>
  </div>
  )
}

/**
 * 
 * @param {string|undefined} title 
 * @returns {React.ReactElement}
 */
function titleView(title) {
  if (!title) {
    return <div/>
  }
  return <div className='border-b-1 border-gray-500 text-bold pl-2 pt-2'>
    {title}
  </div>
}

/**
 * Parse a code block "metastring" (the bit after the language tag).
 * Currently wraps the string with `{}` braces and parses as yaml...
 * Might revisit this later...
 * 
 * @param {string|undefined} metastring 
 * @returns {object}
 */
function parseMetastring(metastring) {
  if (!metastring) {
    return {}
  }
  const yamlstr = `{${metastring}}`
  try {
    return yaml.load(yamlstr)
  } catch (e) {
    console.warn(`error parsing code block metastring "${metastring}":`, e)
    return {}
  }
}

// TODO: move to its own file, make pretty, etc
/**
 * 
 * @param {object} props
 * @param {string} props.src
 * @param {string} [props.className]
 * @returns {React.ReactElement}
 */
function CopyButton({className, src }) {
  return (
    <div className={clsx('absolute', 'top-1', 'right-4', 'text-white', className)}>
      <CopyToClipboard 
        text={src}
        onCopy={() => toast.success('Copied!')} >
          <button>copy</button>
      </CopyToClipboard>
      <ToastContainer 
        position='bottom-center'
        autoClose={1500}
        hideProgressBar={true}
        newestOnTop={true}
        />
    </div>
  )
}