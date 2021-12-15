// ===================================================================== Imports
import FAQPageData from '../content/pages/faq.json';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
// import countly from 'Lib/countly'
// ===================================================================== Exports
export default function Home() {
  const sections = FAQPageData.page_content;
  return (
    <>
      <Navigation />
      <main className="page page-faq">
        {sections.map((section, index) => (
          <BlockBuilder id={`faq_section_${index + 1}`} key={`faq_section_${index + 1}`} subsections={section} />
        ))}
      </main>
      <Footer />
    </>
  );
}
