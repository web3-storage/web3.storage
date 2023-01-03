import { useEffect } from 'react';

import AboutPageData from '../../../content/pages/about.json';
import Scroll2Top from '../../../components/scroll2top/scroll2top.js';
import BlockBuilder from '../../../components/blockbuilder/blockbuilder.js';
import { initFloaterAnimations } from '../../../lib/floater-animations.js';
import GeneralPageData from '../../../content/pages/general.json';

// ====================================================================== Exports
export default function Home() {
  const sections = AboutPageData.page_content;
  const animations = AboutPageData.floater_animations;

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
      <main className="page page-about">
        {sections.map((section, index) => (
          <BlockBuilder id={`about_section_${index + 1}`} key={`about_section_${index + 1}`} subsections={section} />
        ))}
      </main>

      <Scroll2Top />
    </>
  );
}

export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: 'Products - web3.storage - Easy-to-use decentralized storage',
      description:
        'The easiest way to store data on the decentralized web, with data available over the IPFS network and secured in Filecoin deals',
      breadcrumbs: [crumbs.index, crumbs.web3storage],
    },
  };
}
