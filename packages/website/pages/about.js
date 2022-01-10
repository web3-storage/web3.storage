// ===================================================================== Imports
import AboutPageData from '../content/pages/about.json';
import MessageBanner from '../components/messagebanner/messagebanner.js';
import Navigation from '../components/navigation/navigation.js';
import Scroll2Top from '../components/scroll2top/scroll2top.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';

// ===================================================================== Exports
export default function Home() {
  const sections = AboutPageData.page_content;
  return (
    <>
      <MessageBanner />

      <Navigation />

      <main className="page page-about">
        {sections.map((section, index) => (
          <BlockBuilder id={`about_section_${index + 1}`} key={`about_section_${index + 1}`} subsections={section} />
        ))}
      </main>

      <Scroll2Top />

      <Footer />
    </>
  );
}
