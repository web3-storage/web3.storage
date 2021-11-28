import '../styles/global.scss';
import { Provider } from 'react-redux';

import withAuthorizedReduxStore from '../store/store';

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

export default withAuthorizedReduxStore(App);
