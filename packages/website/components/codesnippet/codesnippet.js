import { useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import shell from 'highlight.js/lib/languages/shell';
import go from 'highlight.js/lib/languages/go';
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('go', go);
hljs.registerLanguage('json', json);

function extractRegion(src, regionName) {
  if (!regionName) {
    return src;
  }

  const startPattern = new RegExp(`//\\s*#region\\s+${regionName}`);
  const endPattern = new RegExp(`//\\s*#endregion\\s+${regionName}`);
  const lines = src.split(/\r?\n/);
  const regionLines = [];
  let found = false;
  for (const line of lines) {
    if (!found) {
      if (line.match(startPattern)) {
        found = true;
      }
      continue;
    }
    if (line.match(endPattern)) {
      break;
    }
    regionLines.push(line);
  }
  if (!found) {
    console.warn(`No region matching ${regionName} found in CodeSnippet src`);
  }
  return regionLines.join('\n');
}

export default function CodeSnippet(props) {
  const { src, region, lang, ...codeBlockProps } = props;

  useEffect(() => {
    hljs.highlightAll();
  });

  if (lang) {
    codeBlockProps.className = `language-${lang}`;
  }

  return (
    <pre>
      <code className={codeBlockProps.className}>{extractRegion(src, region)}</code>
    </pre>
  );
}
