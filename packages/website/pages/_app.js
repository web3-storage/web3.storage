import '../styles/global.scss';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import Script from 'next/script';

import Metadata from 'components/general/metadata';
import RestrictedRoute from 'components/general/restrictedRoute';
import AppProviders from 'components/general/appProviders';
import {
  PageBannerPortal,
  defaultPortalElementId,
  PageBannerPortalContainerContext,
} from '../components/page-banner/page-banner-portal.js';
import MessageBanner from '../components/messagebanner/messagebanner.js';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';

/**
 * App root Component
 */
const App = ({ Component, pageProps }) => {
  const { pathname } = useRouter();
  const productRoutes = [
    '/login',
    '/login/signups-closed/try-w3up',
    '/account',
    '/account/payment',
    '/tokens',
    '/callback',
  ];
  const productApp = productRoutes.includes(pathname);
  const pageClass = pathname.includes('docs') ? 'docs-site' : productApp ? 'product-app' : 'marketing-site';
  const [pageBannerPortalEl, setPageBannerPortalEl] = useState();

  useEffect(() => {
    document.querySelector('body')?.classList.add(pageClass);
  });

  return (
    <AppProviders authorizationProps={{ ...pageProps }}>
      <Metadata {...pageProps} />
      <RestrictedRoute {...pageProps}>
        <Script src="https://track.web3.storage/latest.js" data-hostname="web3.storage" data-ignore-pages="/callback" />
        {/* We're specifying download extensions here because the 'doc' extension conflicts
            with the /docs URL path for our docs pages.  This is a workaround for a bad regex on
            the Simple Analytics side.  See https://docs.simpleanalytics.com/automated-events */}
        <Script data-extensions="pdf,csv,docx,xlsx,zip,xls" src="https://track.web3.storage/auto-events.js" />
        <noscript>
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src="https://queue.simpleanalyticscdn.com/noscript.gif?hostname=web3.storage"
            alt=""
            referrerPolicy="no-referrer-when-downgrade"
          />
        </noscript>

        <div
          style={{
            // needed so this banner is above .corkscrew-background
            zIndex: 1,
            // must be positioned for zIndex to take effect
            position: 'relative',
          }}
        >
          <PageBannerPortal id={defaultPortalElementId} contentsRef={setPageBannerPortalEl}></PageBannerPortal>
        </div>

        <PageBannerPortalContainerContext.Provider value={pageBannerPortalEl}>
          <div id="master-container" className={clsx(pageClass)} style={{ zIndex: 0 }}>
            {productApp && <div className="corkscrew-background"></div>}

            <MessageBanner />
            <Navigation isProductApp={productApp} breadcrumbs={pageProps.breadcrumbs} />
            <Component {...pageProps} />
            <Footer isProductApp={productApp} />
          </div>
        </PageBannerPortalContainerContext.Provider>
      </RestrictedRoute>
    </AppProviders>
  );
};

export default App;
