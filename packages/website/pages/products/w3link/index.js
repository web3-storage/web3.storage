import w3linkPageData from '../../../content/pages/w3link.json';
import Scroll2Top from '../../../components/scroll2top/scroll2top.js';
import BlockBuilder from '../../../components/blockbuilder/blockbuilder.js';
import GeneralPageData from '../../../content/pages/general.json';

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
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: 'Products - w3link - Fast IPFS HTTP gateway',
      description: 'HTTP gateway for lightning fast reads from the IPFS network.',
      breadcrumbs: [crumbs.index, crumbs.w3link],
    },
  };
}

export default w3link;
