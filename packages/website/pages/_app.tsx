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

  return (
    <Provider store={store}>
      {pathname !== '/' && <CorkscrewBackground />}
      <Component {...pageProps} />
    </Provider>
  );
};

export default withAuthorization(withReduxStore(App));
