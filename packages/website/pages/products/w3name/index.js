import W3namePageData from '../../../content/pages/w3name.json';
import Scroll2Top from '../../../components/scroll2top/scroll2top.js';
import BlockBuilder from '../../../components/blockbuilder/blockbuilder.js';
import GeneralPageData from '../../../content/pages/general.json';

const W3name = () => {
  const sections = W3namePageData.page_content;

  return (
    <>
      <main className="page page-w3name">
        {sections.map((section, index) => (
          <BlockBuilder id={`w3name_section_${index + 1}`} key={`w3name_section_${index + 1}`} subsections={section} />
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
      title: 'Products - w3name - Mutable pointers to an immutable web',
      description: 'Cryptographically signed mutable pointers using IPNS. Content addressing for a dynamic web.',
      breadcrumbs: [crumbs.index, crumbs.w3name],
    },
  };
}

export default W3name;
