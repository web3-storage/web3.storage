import '../styles/global.scss';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import clsx from 'clsx';
import Script from 'next/script';

import Metadata from 'components/general/metadata';
import RestrictedRoute from 'components/general/restrictedRoute';
import AppProviders from 'components/general/appProviders';
import MessageBanner from '../components/messagebanner/messagebanner.js';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';

/**
 * App root Component
 */
const App = ({ Component, pageProps }) => {
  const { pathname } = useRouter();
  const productRoutes = ['/login', '/account', '/account/payment', '/tokens', '/callback'];
  const productApp = productRoutes.includes(pathname);
  const pageClass = pathname.includes('docs') ? 'docs-site' : productApp ? 'product-app' : 'marketing-site';

  useEffect(() => {
    document.querySelector('body')?.classList.add(pageClass);
  });

  return (
    <AppProviders authorizationProps={{ ...pageProps }}>
      <Metadata {...pageProps} />
      <RestrictedRoute {...pageProps}>
        <Script
          type="text/javascript"
          id="sa_event"
          dangerouslySetInnerHTML={{
            __html: `
          window.sa_event=window.sa_event||function(){var a=[].slice.call(arguments);window.sa_event.q?window.sa_event.q.push(a):window.sa_event.q=[a]};
          `,
          }}
        />
        <Script src="https://track.web3.storage/latest.js" data-hostname="web3.storage" data-ignore-pages="/callback" />
        <Script src="https://track.web3.storage/auto-events.js" />
        <noscript>
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src="https://queue.simpleanalyticscdn.com/noscript.gif?hostname=web3.storage"
            alt=""
            referrerPolicy="no-referrer-when-downgrade"
          />
        </noscript>
        <div id="master-container" className={clsx(pageClass)}>
          {productApp && <div className="corkscrew-background"></div>}
          <MessageBanner />
          <Navigation isProductApp={productApp} breadcrumbs={pageProps.breadcrumbs} />
          <Component {...pageProps} />
          <Footer isProductApp={productApp} />
        </div>
      </RestrictedRoute>
    </AppProviders>
  );
};

export default App;
