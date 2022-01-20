import '../styles/global.scss';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import Corkscrew from '../assets/illustrations/corkscrew';
import Metadata from 'components/general/metadata';
import RestrictedRoute from 'components/general/restrictedRoute';
import AppProviders from 'components/general/appProviders';
import MessageBanner from '../components/messagebanner/messagebanner.js';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';

/**
 * App root Component
 */
const App = ({ Component, pageProps }: any) => {
  const { pathname } = useRouter();
  const marketingRoutes = ['/', '/tiers', '/about', '/faq', '/terms'];
  const notMarketingSite = !marketingRoutes.includes(pathname);

  return (
    <AppProviders authorizationProps={{ ...pageProps }}>
      <Metadata {...pageProps} />
      <RestrictedRoute {...pageProps}>
        <div
          id="master-container"
          className={clsx(notMarketingSite ? 'product-app' : 'marketing-site')}>
          {notMarketingSite && <Corkscrew className="corkscrew-background"/>}
          <MessageBanner />
          <Navigation isProductApp={notMarketingSite} />
          <Component {...pageProps} />
          <Footer />
        </div>
      </RestrictedRoute>
    </AppProviders>
  );
};

export default App;
