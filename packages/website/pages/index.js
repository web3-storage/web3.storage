// ===================================================================== Imports
import IndexPageData from '../content/pages/index.json';
import MessageBanner from '../components/messagebanner/messagebanner.js';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
// import countly from 'Lib/countly'
// ===================================================================== Exports
export default function Home() {
  const sections = IndexPageData.page_content;
  return (
    <>
      <MessageBanner />
      <Navigation />
      <main className="page page-index">
        {sections.map((section, index) => (
          <BlockBuilder id={`section_${index + 1}`} key={`section_${index + 1}`} subsections={section} />
        ))}
      </main>
      <Footer />
    </>
  );
}
