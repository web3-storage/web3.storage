import React, { Component } from 'react';
import Router from 'next/router';

import { getOrCreateStore } from './store';
import { getUserData } from './actions';
import { AppReduxState } from 'store';

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

/**
 * Wrapper that initializes with authorization, setting user data if not applicable
 */
export default function withAuthorization(App) {
  return class AppWithAuthorization extends Component<{ appState: AppReduxState }> {
    static async getInitialProps(appContext) {
      const {
        ctx: { res, req, pathname },
      } = appContext;

      // Initializing props
      const pageProps = { ...(await App.getInitialProps?.(appContext)) };

      // Getting any authentication cookies if available
      const authCookie = !!req ? req.cookies.authorization : document.cookie.split('authorization=')[1]?.split(';')[0];

      // Early return on the login page
      if (pathname.indexOf('/login') >= 0) {
        return pageProps;
      }

      // Initial authorization check for non login routes
      if (!authCookie) {
        return redirectToLogin(res, pageProps);
      }

      // Initializing store for the first time
      const store = getOrCreateStore(pageProps.appState);

      // store
      if (!store.getState().userData) {
        // Getting user data
        const userData = await getUserData(authCookie);

        if (!userData.payload) {
          // Secondary unauthorized access check, redirecting to login
          return redirectToLogin(res, pageProps);
        }

        store.dispatch(userData);
      }

      return {
        ...pageProps,
        appState: store.getState(),
      };
    }

    render() {
      return <App {...this.props} store={this.props.appState} />;
    }
  };
}
