import React, { useCallback, useState } from 'react';

import { deleteUpload, getUploads, renameUpload } from 'lib/api';

/**
 * @typedef {import('../../lib/api').UploadArgs} UploadArgs
 * @typedef {import('web3.storage').Upload} Upload
 */

/**
 * @typedef {Object} Deal
 * @property {string} activation
 * @property {string} created
 * @property {string} dataCid
 * @property {string} dataModelSelector
 * @property {number} dealId
 * @property {string} expiration
 * @property {string} pieceCid
 * @property {string} status
 * @property {string} storageProvider
 * @property {string} updated
 */

/**
 * @typedef {Object} Pin
 * @property {string} peerId
 * @property {string} region
 * @property {string} pearName
 * @property {string} pinned
 * @property {string} updated
 */

/**
 * @typedef {Object} UploadsContextProps
 * @property {Upload[]} uploads Uploads available in this account
 * @property {(cid: string) => Promise<void>} deleteUpload Method to delete an existing upload
 * @property {(cid: string, name: string)=>Promise<void>} renameUpload Method to rename an existing upload
 * @property {(args?: UploadArgs) => Promise<Upload[]>} getUploads Method that refetches list of uploads based on certain params
 * @property {(file:File) => Promise<void>} uploadFile Method to upload a new file
 * @property {boolean} isFetchingUploads Whether or not new uploads are being fetched
 * @property {number|undefined} fetchDate The date in which the last uploads list fetch happened
 */

/**
 * @typedef {Object} UploadsProviderProps
 * @property {import('react').ReactNode} children
 */

/**
 * Uploads Context
 */
export const UploadsContext = React.createContext(/** @type {any} */ (undefined));

/**
 * Uploads Info Hook
 *
 * @param {UploadsProviderProps} props
 */
export const UploadsProvider = ({ children }) => {
  const [uploads, setUploads] = useState(/** @type {Upload[]} */ ([]));
  const [isFetchingUploads, setIsFetchingUploads] = useState(false);
  const [fetchDate, setFetchDate] = useState(/** @type {number|undefined} */ (undefined));

  const uploadFile = useCallback(
    /** @param {File} file */
    async file => {
      // TODO: Enabled to hook up
      // const client = new Web3Storage({
      //   token: await getToken(),
      //   endpoint: new URL(API),
      // });
      // setUploading(true);
      // try {
      //   let totalBytesSent = 0;
      //   await client.put([file], {
      //     name: file.name,
      //     onStoredChunk: size => {
      //       totalBytesSent += size;
      //       setPercentComplete(Math.round((totalBytesSent / file.size) * 100));
      //     },
      //   });
      // } finally {
      //   await queryClient.invalidateQueries('get-uploads');
      //   setUploading(false);
      //   router.push('/files');
      // }
    },
    []
  );

  const getUploadsCallback = useCallback(
    /** @type {(args?: UploadArgs) => Promise<Upload[]>}} */
    async (args = { size: 1, before: new Date().toISOString() }) => {
      setIsFetchingUploads(true);
      const updatedUploads = await getUploads(args);
      setUploads(updatedUploads);
      setIsFetchingUploads(false);
      setFetchDate(Date.now());

      return updatedUploads;
    },
    [setUploads, setIsFetchingUploads]
  );

  return (
    <UploadsContext.Provider
      value={
        /** @type {UploadsContextProps} */
        ({
          uploadFile,
          deleteUpload,
          renameUpload,
          getUploads: getUploadsCallback,
          uploads,
          isFetchingUploads,
          fetchDate,
        })
      }
    >
      {children}
    </UploadsContext.Provider>
  );
};

/**
 * Uploads hook
 *
 * @return {UploadsContextProps}
 */
export const useUploads = () => {
  const context = React.useContext(UploadsContext);
  if (context === undefined) {
    throw new Error('useUploads must be used within a UploadsProvider');
  }
  return context;
};
