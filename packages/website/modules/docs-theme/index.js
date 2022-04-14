import React, { useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';
import Head from 'next/head';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import shell from 'highlight.js/lib/languages/shell';
import go from 'highlight.js/lib/languages/go';
import json from 'highlight.js/lib/languages/json';

import Sidebar from './sidebar/sidebar';
import Feedback from './feedback/feedback';
import Toc from './toc/toc';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('go', go);
hljs.registerLanguage('json', json);

export default function Docs(props) {
  const { meta, route, ...rest } = props;

  useEffect(() => {
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
            <Sidebar />
            <article className="docs-body-container">
              <main className="docs-body">
                <MDXProvider>{children}</MDXProvider>
                <Feedback />
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
