import React, { useCallback, useState } from 'react';

import { getPinRequests, deletePinRequest } from 'lib/api';

/**
 * @typedef {Object} PinStatus
 * @property {string} requestid
 * @property {Pin} pin
 * @property {string} status
 * @property {string} created
 */

/**
 * @typedef {Object} Pin
 * @property {string} cid
 * @property {string} name
 */

/**
 * @typedef {Object} PinRequestsContextProps
 * @property {PinStatus[]} pinRequests A page of pin requests
 * @property {number} pages Total pages of pin requests
 * @property {number} count Total pin requests
 * @property {(requestid: string) => Promise<void>} deletePinRequest Method to delete an existing pin request
 * @property {(args: { status: string, page: number, size: number }) => Promise<PinStatus[]>} getPinRequests Fetch pin requests based on params
 * @property {number|undefined} fetchDate The date in which the last pin requests list fetch happened
 * @property {boolean} isFetching Whether or not pinned files are being fetched
 */

/**
 * @typedef {Object} PinRequestsProviderProps
 * @property {import('react').ReactNode} children
 */

export const PinRequestsContext = React.createContext(/** @type {any} */ (undefined));

/**
 * @param {PinRequestsProviderProps} props
 */
export const PinRequestsProvider = ({ children }) => {
  const [pinRequests, setPinRequests] = useState(/** @type {PinStatus[]} */ ([]));
  const [fetchDate, setFetchDate] = useState(/** @type {number|undefined} */ (undefined));
  const [isFetching, setIsFetching] = useState(false);
  const [pages, setPages] = useState(0);
  const [count, setCount] = useState(0);

  const pinRequestsCallback = useCallback(
    /** @type {(args: { status: string, page: number, size: number }) => Promise<PinStatus[]>} */
    async ({ status, page, size }) => {
      setIsFetching(true);
      const pinsResponse = await getPinRequests({ status, page, size });
      setPinRequests(pinsResponse.results);
      setPages(Math.ceil(pinsResponse.count / size));
      setCount(pinsResponse.count);
      setFetchDate(Date.now());
      setIsFetching(false);
      return pinsResponse.results;
    },
    [setPinRequests, setPages, setCount]
  );

  return (
    <PinRequestsContext.Provider
      value={
        /** @type {PinRequestsContextProps} */
        ({
          getPinRequests: pinRequestsCallback,
          deletePinRequest,
          pinRequests,
          isFetching,
          fetchDate,
          pages,
          count,
        })
      }
    >
      {children}
    </PinRequestsContext.Provider>
  );
};

/**
 * @returns {PinRequestsContextProps}
 */
export const usePinRequests = () => {
  const context = React.useContext(PinRequestsContext);
  if (context === undefined) {
    throw new Error('usePinRequests must be used within a PinRequestsProvider');
  }
  return context;
};
