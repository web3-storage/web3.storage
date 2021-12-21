import React, { useCallback, useState } from 'react';

import { deleteToken, getTokens, createToken } from 'lib/api';

/** @typedef {{ _id: string, name: string, secret: string, hasTokens?: boolean }} Token */

/**
 * @typedef {Object} TokensContextProps
 * @property {Token[]} tokens Tokens available in this account
 * @property {(id: string) => Promise<void>} deleteToken Method to delete an existing Token
 * @property {() => Promise<Token[]>} getTokens Method that refetches list of Tokens based on certain params
 * @property {(name: string) => Promise<Token>} createToken Method that creates a new token
 * @property {boolean} isFetchingTokens Whether or not new Tokens are being fetched
 * @property {boolean} isCreating Whether or not a new token is being created
 * @property {number|undefined} fetchDate The date in which the last Tokens list fetch happened
 */

/**
 * @typedef {Object} TokensProviderProps
 * @property {import('react').ReactNode} children
 */

/**
 * Tokens Context
 */
export const TokensContext = React.createContext(/** @type {any} */ (undefined));

/**
 * Tokens Info Hook
 *
 * @param {TokensProviderProps} props
 */
export const TokensProvider = ({ children }) => {
  const [tokens, setTokens] = useState(/** @type {Token[]} */ ([]));
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fetchDate, setFetchDate] = useState(/** @type {number|undefined} */ (undefined));

  const getTokensCallback = useCallback(
    /** @type {() => Promise<Token[]>}} */
    async () => {
      setIsFetchingTokens(true);
      const updatedTokens = await getTokens();
      setTokens(updatedTokens);
      setIsFetchingTokens(false);
      setFetchDate(Date.now());

      return updatedTokens;
    },
    [setTokens, setFetchDate, setIsFetchingTokens]
  );

  const createTokensCallback = useCallback(
    /** @type {(name: string) => Promise<Token>}} */
    async name => {
      setIsCreating(true);
      const newToken = await createToken(name);
      setIsCreating(false);
      return newToken;
    },
    [setIsCreating]
  );

  return (
    <TokensContext.Provider
      value={
        /** @type {TokensContextProps} */
        ({
          deleteToken,
          createToken: createTokensCallback,
          getTokens: getTokensCallback,
          tokens,
          isFetchingTokens,
          isCreating,
          fetchDate,
        })
      }
    >
      {children}
    </TokensContext.Provider>
  );
};

/**
 * Tokens hook
 *
 * @return {TokensContextProps}
 */
export const useTokens = () => {
  const context = React.useContext(TokensContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokensProvider');
  }
  return context;
};
