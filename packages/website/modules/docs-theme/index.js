import React, { useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';

import Head from 'next/head';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import powershell from 'highlight.js/lib/languages/powershell';
import bash from 'highlight.js/lib/languages/bash';
import go from 'highlight.js/lib/languages/go';
import json from 'highlight.js/lib/languages/json';

import Sidebar from './sidebar/sidebar';
import Feedback from './feedback/feedback';
import Toc from './toc/toc';
import DocsPagination from './docspagination/docspagination';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('go', go);
hljs.registerLanguage('json', json);

export default function Docs(props) {
  const { meta, route, ...rest } = props;

  useEffect(() => {
    const pres = document.querySelectorAll('pre');

    pres.forEach((pre) => {
      const code = pre.firstElementChild?.innerHTML;
      if (code) {
        const button = document.createElement('button');
        const textarea = document.createElement('textarea');
        textarea.innerHTML = code;
        textarea.style.position = 'absolute';
        textarea.style.top = '0';
        textarea.style.left = '-99999px';
        button.classList.add('code-copy-button');
        document.body.appendChild(textarea);

        button.addEventListener('click', (event) => {
          if (!navigator.clipboard) {
            textarea.focus({ preventScroll: true });
            textarea.select();
            try {
              document.execCommand('copy');
              console.log('copied!');
            } catch (err) {
              console.error(err);
            }
            return;
          }
          navigator.clipboard.writeText(textarea.value).then(
            function () {
              console.log('copied!');
            },
            function (err) {
              console.error(err);
            }
          );
        });

        pre.appendChild(button);
      }
      
    });

    hljs.highlightAll();
  });

  const sharedHead = (
    <Head>
      <meta property="og:title" content={meta.title} />
      <meta property="og:site_name" content="Docs - Web3 Storage - Simple file storage with IPFS &amp; Filecoin" />
      <meta property="og:description" content={meta.description} />
    </Head>
  );

  if (route.startsWith('/docs')) {
    return function Layout({ children }) {
      return (
        <>
          {sharedHead}
          <div className="docs-container">
            <Sidebar openMenu={null} />
            <article className="docs-body-container">
              <main className="docs-body">
                <MDXProvider>{children}</MDXProvider>
                <Feedback />
                <DocsPagination />
              </main>
              <Toc />
            </article>
          </div>
        </>
      );
    };
  }

  return function Layout({ children }) {
    return (
      <>
        {sharedHead}
        {children}
      </>
    );
  };
}
