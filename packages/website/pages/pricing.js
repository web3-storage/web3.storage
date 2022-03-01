// ===================================================================== Imports
import { useEffect } from 'react';

import TiersPageData from '../content/pages/pricing.json';
import Scroll2Top from '../components/scroll2top/scroll2top.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
import { initFloaterAnimations } from '../lib/floater-animations.js';

// ===================================================================== Exports
export default function Home() {
  const sections = TiersPageData.page_content;
  const animations = TiersPageData.floater_animations;

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
      <main className="page page-pricing">
        {sections.map((section, index) => (
          <BlockBuilder id={`pricing_section_${index + 1}`} key={`section_${index}`} subsections={section} />
        ))}
      </main>

      <Scroll2Top />
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      title: 'Pricing - Web3 Storage - Simple file storage with IPFS & Filecoin',
      description:
        'Web3.Storage is a service that grows with your needs, and offers a significant free tier with no strings attached.',
    },
  };
}
