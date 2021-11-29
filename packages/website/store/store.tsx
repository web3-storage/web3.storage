import React, { Component } from 'react';
import { createStore } from 'redux';

import reducers from './reducers';
import { AppReduxState } from '.';

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

export const getOrCreateStore = (initialState: AppReduxState = { userData: null }) => {
  // Always make a new store if server, otherwise state is shared between requests
  if (typeof window === 'undefined') {
    return createStore(reducers, initialState);
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = createStore(reducers, initialState);
  }
  return window[__NEXT_REDUX_STORE__];
};

/**
 * Wrapper that initializes the redux store
 */
export default function withReduxStore(App) {
  return class AppWithRedux extends Component<{
    appState: AppReduxState;
  }> {
    static async getInitialProps(appContext) {
      // Initializing props
      const pageProps = { ...(await App.getInitialProps?.(appContext)) };

      // SPA Navigation proceeds as normal
      if (typeof window !== 'undefined' && !!window[__NEXT_REDUX_STORE__]) {
        return { pageProps, appState: window[__NEXT_REDUX_STORE__] };
      }

      // Initializing store for the first time
      const store = getOrCreateStore();

      // TODO: Any additional store preconfigurations/initializations

      // Provide the store to getInitialProps of pages
      appContext.ctx.store = store;

      return {
        ...pageProps,
        appState: store.getState(),
      };
    }

    render() {
      return <App {...this.props} store={getOrCreateStore({ ...this.props.appState })} />;
    }
  };
}
