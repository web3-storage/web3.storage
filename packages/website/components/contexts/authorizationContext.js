import React from 'react';
import { useQuery } from 'react-query';

import constants from 'lib/constants';
import { isLoggedIn } from 'lib/magic';

/**
 * @typedef {Object} AuthorizationProviderProps
 * @property {import('react').ReactChildren} children
 * @property {boolean} [isRestricted] whether or not this route is restricted to auhtenticated users
 * @property {string} [redirectTo] If redirectTo is set, redirect if the user was not found
 * @property {boolean} [redirectIfFound] If redirectIfFound is also set, redirect if the user was found.
 * @property {boolean} [authOnLoad] Whether or not to check for magic authorization, defaults to true
 */

/**
 * @typedef {Object} AuthorizationContextProps
 * @property {boolean} isLoggedIn Whether or not the user has logged in
 * @property {"idle" | "error" | "loading" | "success"} status react-query status
 * @property {unknown} error react-query error
 * @property {boolean} isFetching react-query isFetching
 * @property {boolean} isLoading react-query isLoading
 */

/**
 * Authorization Context
 */
export const AuthorizationContext = React.createContext(/** @type {any} */ (undefined));

/**
 * Authorization Provider that gets authorization info from the magic sdk and makes it available across the entire app
 *
 * @param {AuthorizationProviderProps} props
 *
 * @return
 */
export const AuthorizationProvider = ({ children, authOnLoad = true }) => {
  const {
    status,
    data: loggedIn,
    error,
    isFetching,
    isLoading,
  } = useQuery('magic-user', isLoggedIn, {
    staleTime: constants.MAGIC_TOKEN_LIFESPAN,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: authOnLoad,
  });

  return (
    <AuthorizationContext.Provider
      value={
        /** @type {AuthorizationContextProps} */
        { status, isLoggedIn: !!loggedIn, error, isFetching, isLoading }
      }
    >
      {children}
    </AuthorizationContext.Provider>
  );
};

/**
 * Authorization Hook
 *
 * @return {AuthorizationContextProps}
 */
export const useAuthorization = () => {
  const context = React.useContext(AuthorizationContext);
  if (context === undefined) {
    throw new Error('useAuthorization must be used within a AuthorizationProvider');
  }
  return context;
};
