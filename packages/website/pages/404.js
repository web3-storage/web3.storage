// ===================================================================== Imports
import GeneralPageData from '../content/pages/general.json';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';

// ===================================================================== Exports
const blocks = GeneralPageData.error_404.sections;

const Custom404 = () => (
  <main className="page-404">
    <BlockBuilder id="error_section-1" subsections={blocks} />
  </main>
);

export default Custom404;
