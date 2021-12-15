import '../styles/global.scss';
import { Provider } from 'react-redux';
import { useRouter } from 'next/router';

import withAuthorization from '../store/withAuthorization';
import withReduxStore from '../store/store';
import CorkscrewBackground from '../assets/illustrations/corkscrewBlurred';

/**
 * App root Component
 */

const App = ({ Component, store, pageProps, isBase }: any) => {
  const { pathname } = useRouter();
  const marketingRoutes = ['/', '/pricing', '/about', '/faq', '/terms'];
  const notMarketingSite = !marketingRoutes.includes(pathname);

  return (
    <Provider store={store}>
      { notMarketingSite && <CorkscrewBackground />}
      <Component {...pageProps} />
    </Provider>
  );
};

export default withAuthorization(withReduxStore(App));
