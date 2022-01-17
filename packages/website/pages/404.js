// ===================================================================== Imports
// import GeneralPageData from '../content/pages/general.json';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';

// ===================================================================== Exports
const block = {
  id: 'error_hero-header',
  grid: ['middle', 'noGutter'],
  columns: [
    {
      type: 'hero',
      page: 'error',
      cols: {
        num: 'col-8_md-10_sm-8',
        push_left: 'off-2_md-1_sm-2',
      },
      format: 'header',
      heading: '404',
      cta: {
        url: '/',
        text: 'GO BACK HOME',
        theme: 'text-purple',
        event: '',
        ui: '',
        action: '',
      },
    },
  ],
};

const Custom404 = () => (
  <main className="page-404">
    <Navigation />

    <BlockBuilder id="error_section-1" subsections={[block]} />

    <Footer />
  </main>
);

export default Custom404;
