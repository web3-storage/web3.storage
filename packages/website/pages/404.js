import { useEffect } from 'react';

import GeneralPageData from '../content/pages/general.json';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
import countly from '../lib/countly';

const blocks = GeneralPageData.error_404.sections;

export default function Custom404() {
  useEffect(() => {
    countly.trackEvent(countly.events.NOT_FOUND, {
      path: '/404',
    });
  }, []);

  return (
    <main className="page-404">
      <BlockBuilder id="error_section-1" subsections={blocks} />
    </main>
  );
}
