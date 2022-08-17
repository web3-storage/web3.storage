import w3linkPageData from '../../../content/pages/w3link.json';
import Scroll2Top from '../../../components/scroll2top/scroll2top.js';
import BlockBuilder from '../../../components/blockbuilder/blockbuilder.js';

const w3link = () => {
  const sections = w3linkPageData.page_content;

  return (
    <>
      <main className="page page-w3link">
        {sections.map((section, index) => (
          <BlockBuilder id={`w3link_section_${index + 1}`} key={`w3link_section_${index + 1}`} subsections={section} />
        ))}
      </main>

      <Scroll2Top />
    </>
  );
};

export function getStaticProps() {
  return {
    props: {
      title: 'About - Web3 Storage - Simple file storage with IPFS & Filecoin',
      description:
        'About Web3.Storage: the easiest way to store data on the decentralized web. Giving developers the power of Filecoin distributed storage and content addressing via a simple HTTP API and handy client libraries.',
    },
  };
}

export default w3link;
