import React, { useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';

import Head from 'next/head';

import CodeHighlightCopy from '../../components/blog/codehighlightcopy/codehighlightcopy';
import Sidebar from './sidebar/sidebar';
import Feedback from './feedback/feedback';
import Toc from './toc/toc';
import DocsPagination from './docspagination/docspagination';

export default function Docs(props) {
  const { meta, route, ...rest } = props;

  useEffect(() => {
    CodeHighlightCopy('.docs-body pre');
  }, []);

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
