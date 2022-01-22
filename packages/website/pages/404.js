// ===================================================================== Imports
import GeneralPageData from '../content/pages/general.json';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
// @ts-ignore

// ===================================================================== Exports
const blocks = GeneralPageData.error_404.sections;

const Custom404 = () => (
  <main className="page-404">
    <Navigation isProductApp={false} />

    <BlockBuilder id="error_section-1" subsections={blocks} />

    <Footer />
  </main>
);

export default Custom404;
