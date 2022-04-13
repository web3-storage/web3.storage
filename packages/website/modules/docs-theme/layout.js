import React, {useEffect} from 'react';
import Head from 'next/head';
import { MDXProvider } from '@mdx-js/react';

import Sidebar from './sidebar';
import Feedback from '../../components/feedback/feedback';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import shell from 'highlight.js/lib/languages/shell';
import go from 'highlight.js/lib/languages/go';
import json from 'highlight.js/lib/languages/json';
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
          <Sidebar />
          <MDXProvider>{children}</MDXProvider>
          <Feedback />
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
