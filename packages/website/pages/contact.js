import { useEffect } from 'react';

import ContactPageData from '../content/pages/contact.json';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
import { initFloaterAnimations } from '../lib/floater-animations.js';
import GeneralPageData from '../content/pages/general.json';

export default function Home() {
  const sections = ContactPageData.page_content;
  const animations = ContactPageData.floater_animations;

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
      <main className="page page-contact">
        {sections.map((section, index) => (
          <BlockBuilder
            id={`contact_section_${index + 1}`}
            key={`contact_section_${index + 1}`}
            subsections={section}
          />
        ))}
      </main>
    </>
  );
}

export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: 'Contact - Web3 Storage - Simple file storage with IPFS & Filecoin',
      description: '',
      breadcrumbs: [crumbs.index, crumbs.contact],
    },
  };
}
