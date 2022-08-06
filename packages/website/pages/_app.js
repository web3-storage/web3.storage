import '../styles/global.scss';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import clsx from 'clsx';

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
  const productRoutes = ['/login', '/account', '/tokens', '/callback'];
  const productApp = productRoutes.includes(pathname);

  // set class name on body
  let pageClass = 'marketing-site';
  if (pathname.includes('docs')) {
    pageClass = 'docs-site';
  } else if (pathname.includes('blog')) {
    pageClass = 'blog-site';
  } else if (productApp) {
    pageClass = 'product-app';
  } else {
    pageClass = 'marketing-site';
  }

  useEffect(() => {
    let body = document.querySelector('body');
    // @ts-ignore
    body?.classList.remove(...body?.classList);
    body?.classList.add(pageClass);
  }, [pageClass]);

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
