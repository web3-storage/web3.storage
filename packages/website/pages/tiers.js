// ===================================================================== Imports
import TiersPageData from '../content/pages/tiers.json';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
// import countly from 'Lib/countly'
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

        <Footer />
      </main>
    </>
  );
}
