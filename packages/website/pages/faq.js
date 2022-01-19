// ===================================================================== Imports
import FAQPageData from '../content/pages/faq.json';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';

// ===================================================================== Exports
export default function Home() {
  const sections = FAQPageData.page_content;
  return (
    <>
      <main className="page page-faq">
        {sections.map((section, index) => (
          <BlockBuilder id={`faq_section_${index + 1}`} key={`faq_section_${index + 1}`} subsections={section} />
        ))}
      </main>
    </>
  );
}
