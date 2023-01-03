import { useEffect } from 'react';

import analytics, { saEvent } from '../lib/analytics';
import GeneralPageData from '../content/pages/general.json';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';

export default function Home() {
  const blocks = GeneralPageData.error_404.sections;
  useEffect(() => {
    saEvent(analytics.events.NOT_FOUND, {
      path: window.location?.pathname ?? 'unknown',
      referrer: typeof window !== 'undefined' ? document.referrer : null,
    });
  }, []);

  return (
    <main className="page-404">
      <BlockBuilder id="error_section-1" subsections={blocks} />
    </main>
  );
}

export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: '404 - Web3 Storage - Simple file storage with IPFS & Filecoin',
      breadcrumbs: [crumbs.index],
    },
  };
}
