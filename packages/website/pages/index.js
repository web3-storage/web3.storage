// ===================================================================== Imports
import IndexPageData from '../content/pages/index.json';
import MessageBanner from '../components/messagebanner/messagebanner.js';
import Navigation from '../components/navigation/navigation.js';
import Scroll2Top from '../components/scroll2top/scroll2top.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';

// ===================================================================== Exports
export default function Home() {
  const sections = IndexPageData.page_content;
  return (
    <>
      <main className="page page-index">
        <MessageBanner />

        <Navigation />

        {sections.map((section, index) => (
          <BlockBuilder id={`section_${index + 1}`} key={`section_${index + 1}`} subsections={section} />
        ))}

        <Scroll2Top />

        <Footer />
      </main>
    </>
  );
}
