import '../styles/global.scss';
import { Provider } from 'react-redux';

import withAuthorization from '../store/withAuthorization';
import withReduxStore from '../store/store';
// import CorkscrewBackground from '../assets/illustrations/corkscrewBlurred';

/**
 * App root Component
 */

const App = ({ Component, store, pageProps }: any) => {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default withAuthorization(withReduxStore(App));
