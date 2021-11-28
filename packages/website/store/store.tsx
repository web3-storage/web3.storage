import React, { Component } from 'react';
import Router from 'next/router';
import { createStore } from 'redux';

import reducers from './reducers';
import { AppReduxState } from '.';
import { getUserData } from './actions';

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

const getOrCreateStore = (initialState: AppReduxState = {}) => {
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

const redirectToLogin = (res, storeState) => {
  if (res) {
    // On the server, we'll use an HTTP response to
    // redirect with the status code of our choice.
    // 307 is for temporary redirects.
    res.writeHead(307, { Location: '/login' });
    res.end();
  } else {
    // On the client, we'll use the Router-object
    // from the 'next/router' module.
    Router.replace('/login');
  }
  return storeState;
};

export default function withAuthorizedReduxStore(App) {
  return class AppWithRedux extends Component<{
    initialAppState?: AppReduxState;
  }> {
    static async getInitialProps(appContext) {
      const {
        ctx: { res, req, pathname },
      } = appContext;
      const pageProps = { ...(await App.getInitialProps?.(appContext)) };

      const authCookie = !!req ? req.cookies.authorization : document.cookie.split('authorization=')[1]?.split(';')[0];

      // Early return on the login page
      if (pathname.indexOf('/login') >= 0) {
        return pageProps;
      }

      // Get or Create the store with `undefined` as initialState
      const store = getOrCreateStore();

      // Initial authorization check for non login routes
      if (!authCookie) {
        return redirectToLogin(res, pageProps);
      }

      // Provide the store to getInitialProps of pages
      appContext.ctx.store = store;

      // get data here
      const userData = await getUserData(authCookie);

      if (!userData.payload) {
        // Secondary unauthorized access check, redirecting to login
        return redirectToLogin(res, pageProps);
      }

      store.dispatch(userData);

      return {
        ...pageProps,
        initialAppState: store.getState(),
      };
    }

    render() {
      return <App {...this.props} store={getOrCreateStore({ ...this.props.initialAppState })} />;
    }
  };
}
