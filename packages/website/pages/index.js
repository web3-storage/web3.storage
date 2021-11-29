// ===================================================================== Imports
import IndexPageData from '../content/pages/index.json';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
// import countly from 'Lib/countly'
// ===================================================================== Exports
export default function Home() {
  const sections = IndexPageData.page_content;
  return (
    <>
      <Navigation />
      <main className="page page-index">
        {sections.map((section, index) => (
          <BlockBuilder key={`section_${index}`} subsections={section} />
        ))}
      </main>
      <Footer />
    </>
  );
}
