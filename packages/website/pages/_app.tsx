import '../styles/global.scss';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import Metadata from 'components/general/metadata';
import RestrictedRoute from 'components/general/restrictedRoute';
import AppProviders from 'components/general/appProviders';
import MessageBanner from '../components/messagebanner/messagebanner.js';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';
import { useEffect } from 'react';

/**
 * App root Component
 */
const App = ({ Component, pageProps }: any) => {
  const { pathname } = useRouter();
  const productRoutes = ['/login', '/account', '/tokens'];
  // const marketingRoutes = ['/', '/pricing', '/about', '/faq', '/terms'];
  const productApp = productRoutes.includes(pathname);
  const pageClass = pathname.includes('docs') ? 'docs-site' : productApp ? 'product-app' : 'marketing-site';

  useEffect(() => {
    document.querySelector('body')?.classList.add(pageClass);
  });

  return (
    <AppProviders authorizationProps={{ ...pageProps }}>
      <Metadata {...pageProps} />
      <RestrictedRoute {...pageProps}>
        <div id="master-container" className={clsx(pageClass)}>
          {productApp && <div className="corkscrew-background"></div>}
          <MessageBanner />
          <Navigation isProductApp={productApp} />
          <Component {...pageProps} />
          <Footer isProductApp={productApp} />
        </div>
      </RestrictedRoute>
    </AppProviders>
  );
};

export default App;
