import React from 'react';
import { useQuery } from 'react-query';

import { getInfo } from 'lib/api.js';
import { useAuthorization } from './authorizationContext.js';

/**
 * @typedef {Object} UserContextProps
 * @property {string} _id
 * @property {string} issuer
 * @property {string} name
 * @property {string} email
 * @property {string} github
 * @property {string} publicAddress
 * @property {string} created
 * @property {string} updated
 */

/**
 * @typedef {Object} UserProviderProps
 * @property {import('react').ReactNode} children
 */

/**
 * User Context
 */
export const UserContext = React.createContext(/** @type {any} */ (undefined));

/**
 * User Info Hook
 *
 * @param {UserProviderProps} props
 */
export const UserProvider = ({ children }) => {
  const { isLoggedIn } = useAuthorization();
  console.log('oh', isLoggedIn);
  const { data } = useQuery('get-info', getInfo, {
    enabled: isLoggedIn,
  });

  return <UserContext.Provider value={{ ...data }}>{children}</UserContext.Provider>;
};

/**
 * User hook
 *
 * @return {UserContextProps}
 */
export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useApp must be used within a AppProvider');
  }
  return context;
};
