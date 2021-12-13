// ===================================================================== Imports
import { useState } from 'react';
import clsx from 'clsx';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

// ====================================================================== Params
/**
 * @param {Object} props.block
 * @param {Object} props.className
 */
// ====================================================================== Export
export default function CodePreview({ block, className }) {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabSelection = (e, ind) => {
    setSelectedTab(ind);
  };

  let highlightedCode = [];
  block.tabs.forEach((tab, i) => {
    highlightedCode.push('');
    tab.lines.forEach((line, j) => {
      const lineNumber = `<span class="code-line-number">${j + 1}</span>`;
      const spacing = `${j + 1 < 10 ? ' ' : ''}`;
      const nextLine = `${lineNumber} ${spacing} ${hljs.highlight(line, { language: 'javascript' }).value}<br>`;
      highlightedCode[i] = highlightedCode[i] + nextLine;
    });
  });
  const code = highlightedCode[selectedTab];
  const output = block.tabs[selectedTab].output;

  return (
    <div className="code-preview-window">
      <div className="cp-thumb-container">
        {block.tabs.map((tab, index) => (
          <button
            key={tab.thumb}
            onClick={e => {
              handleTabSelection(e, index);
            }}
            onKeyPress={e => {
              handleTabSelection(e, index);
            }}
            className={clsx('cp-thumb', index === selectedTab ? 'cp-selected' : '')}
          >
            {tab.thumb}
          </button>
        ))}
      </div>
      <div className="code-preview-tab">
        <pre>
          <code dangerouslySetInnerHTML={{ __html: code }}></code>
          {output && (
            <>
              <code> </code>
              <code className="code-preview-output-label">{output.label}</code>
              <code className="code-preview-output-value">{output.value}</code>
            </>
          )}
        </pre>
      </div>
    </div>
  );
}
