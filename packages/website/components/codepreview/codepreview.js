// ===================================================================== Imports
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

import { elementIsInViewport } from '../../lib/utils.js';
import CopyIcon from '../../assets/icons/copy.js';

hljs.registerLanguage('javascript', javascript);
// ====================================================================== Params
/**
 * @param {Object} props
 * @param {Object} props.block
 */
// ====================================================================== Export
export default function CodePreview({ block }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [contentHeight, setContentHeight] = useState('unset');
  const [contentInViewport, setContentInViewport] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const contentRef = useRef(/** @type {any} */ (null));

  const calculateContentHeight = () => {
    if (contentRef.current) {
      const height = contentRef.current.offsetHeight + 24 + 'px';
      setContentHeight(height);
    }
  };

  useEffect(() => {
    const contentInViewportCheck = () => {
      if (!contentInViewport) {
        setContentInViewport(elementIsInViewport(contentRef.current));
      }
    };

    setTimeout(() => {
      calculateContentHeight();
      contentInViewportCheck();
    }, 1000);

    const resize = () => {
      calculateContentHeight();
    };
    const scroll = () => {
      contentInViewportCheck();
    };

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', scroll);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', scroll);
    };
  }, [contentInViewport]);

  useEffect(() => {
    calculateContentHeight();
  }, [selectedTab]);

  const handleTabSelection = (e, ind) => {
    setSelectedTab(ind);
    setCopyMessage('');
  };

  const fallbackCopyTextToClipboard = txt => {
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = txt;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'Copied!' : 'Could not copy...';
        setCopyMessage(msg);
      } catch (err) {
        console.error(err);
      }

      document.body.removeChild(textArea);
    }
  };

  const copyToClipboard = txt => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(txt);
      return;
    }
    navigator.clipboard.writeText(txt).then(
      function () {
        setCopyMessage('Copied!');
      },
      function (err) {
        setCopyMessage('Could not copy...');
        console.error(err);
      }
    );
  };

  let highlightedCode = [];
  block.tabs.forEach((tab, i) => {
    highlightedCode.push({
      html: '',
      text: '',
    });

    tab.lines.forEach((line, j) => {
      const spacing = `${j + 1 < 10 ? ' ' : ''}`;
      const lineNumber = `<span class="code-line-number">${j + 1 + spacing}</span>`;
      const nextLine =
        j < tab.lines.length - 1
          ? `${lineNumber} ${hljs.highlight(line, { language: 'javascript' }).value}<br>`
          : contentInViewport
          ? `${lineNumber} <span class="cp-typed">${line}<span class="cp-cursor">|</span></span><br>`
          : `${lineNumber} <br>`;
      highlightedCode[i].html = highlightedCode[i].html + nextLine;
      highlightedCode[i].text = highlightedCode[i].text + '\n' + line;
    });
  });

  const code = highlightedCode[selectedTab].html;
  const copyText = highlightedCode[selectedTab].text;
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

      <div className="code-preview-wrapper" style={{ height: contentHeight }}>
        <div ref={contentRef} className="code-preview-content">
          <pre>
            <code dangerouslySetInnerHTML={{ __html: code }}></code>

            <div className={clsx('cp-copy-icon', output ? 'before-output' : '')}>
              <div className="cp-copy-message">{copyMessage}</div>
              <button
                onClick={() => {
                  copyToClipboard(copyText);
                }}
              >
                <CopyIcon />
              </button>
            </div>

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
    </div>
  );
}
