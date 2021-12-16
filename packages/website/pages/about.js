// ===================================================================== Imports
import AboutPageData from '../content/pages/about.json';
import MessageBanner from '../components/messagebanner/messagebanner.js';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
// import countly from 'Lib/countly'
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
      <Footer />
    </>
  );
}
