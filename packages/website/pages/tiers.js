// ===================================================================== Imports
import TiersPageData from '../content/pages/tiers.json';
import Navigation from '../components/navigation/navigation.js';
import Scroll2Top from '../components/scroll2top/scroll2top.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';

// ===================================================================== Exports
export default function Home() {
  const sections = TiersPageData.page_content;
  return (
    <>
      <main className="page page-pricing">
        <Navigation />

        {sections.map((section, index) => (
          <BlockBuilder id={`pricing_section_${index + 1}`} key={`section_${index}`} subsections={section} />
        ))}

        <Scroll2Top />

        <Footer />
      </main>
    </>
  );
}
