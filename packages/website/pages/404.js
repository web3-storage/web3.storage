import { useEffect } from 'react';
import countly from '../lib/countly';
import GeneralPageData from '../content/pages/general.json';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';

export default function Home() {
  const blocks = GeneralPageData.error_404.sections;

  useEffect(() => {
    countly.trackEvent(countly.events.NOT_FOUND, {
      path: '/404',
    });
  }, []);

  return (
    <main className="page-404">
      <BlockBuilder id="error_section-1" subsections={blocks} />
    </main>
  );
}

export function getStaticProps() {
  return {
    props: {
      title: '404 - Web3 Storage - Simple file storage with IPFS & Filecoin',
    },
  };
}
