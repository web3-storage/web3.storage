import { useEffect } from 'react';

import FAQPageData from '../content/pages/faq.json';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
import { initFloaterAnimations } from '../lib/floater-animations.js';

export default function Home() {
  const sections = FAQPageData.page_content;
  const animations = FAQPageData.floater_animations;

  useEffect(() => {
    let pageFloaters = {};
    initFloaterAnimations(animations).then(result => {
      pageFloaters = result;
    });
    return () => {
      if (pageFloaters.hasOwnProperty('destroy')) {
        pageFloaters.destroy();
      }
    };
  }, [animations]);

  return (
    <>
      <main className="page page-faq">
        {sections.map((section, index) => (
          <BlockBuilder id={`faq_section_${index + 1}`} key={`faq_section_${index + 1}`} subsections={section} />
        ))}
      </main>
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      title: 'FAQ - Web3 Storage - Simple file storage with IPFS & Filecoin',
      description:
        'Frequently asked questions about Web3.Storage. Find out how the easiest way to store data on the decentralized web uses Filecoin and IPFS, or how it differs from other services.',
    },
  };
}
