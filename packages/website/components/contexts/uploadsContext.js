import React, { useCallback, useState, useEffect } from 'react';
import { Web3Storage } from 'web3.storage';

import { API, deleteUpload, getToken, getUploads, renameUpload } from 'lib/api';
import { useUploadProgress } from './uploadProgressContext';
import { useUser } from './userContext';

export const STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * @typedef {import('../../lib/api').UploadArgs} UploadArgs
 * @typedef {import('web3.storage').Upload} Upload
 * @typedef {import('./uploadProgressContext').FileProgress} FileProgress
 * @typedef {import('./uploadProgressContext').UploadProgress} UploadProgress
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
 * @typedef {Object} PinObject
 * @property {string} cid
 * @property {string} _id
 * @property {string} sourceCid
 * @property {string} contentCid
 * @property {string} authKey
 * @property {string} name
 * @property {any} meta
 * @property {boolean | null} deleted
 * @property {string} created
 * @property {string} updated
 * @property {Pin[]} pins
 * @property {string[]} delegates
 */

/**
 * @typedef {Object} UploadsContextProps
 * @property {Upload[]} uploads A Page of uploads
 * @property {number} pages Total pages of uploads
 * @property {number} count Total uploads
 * @property {(cid: string) => Promise<void>} deleteUpload Method to delete an existing upload
 * @property {(cid: string, name: string)=>Promise<void>} renameUpload Method to rename an existing upload
 * @property {(args?: UploadArgs) => Promise<Upload[]>} getUploads Method that fetches list of uploads based on certain params
 * @property {(file:FileProgress) => Promise<void>} uploadFiles Method to upload a new file
 * @property {boolean} isFetchingUploads Whether or not new uploads are being fetched
 * @property {number|undefined} fetchDate The date in which the last uploads list fetch happened
 * @property {UploadProgress} uploadsProgress The progress of any current uploads
 * @property {() => boolean } clearUploadedFiles clears completed files from uploads list
 */

/**
 * @typedef {Object} UploadsProviderProps
 * @property {import('react').ReactNode} children
 */

/**
 * Uploads Context
 */
export const UploadsContext = React.createContext(/** @type {any} */ (undefined));

let client;

/**
 * Uploads Info Hook
 *
 * @param {UploadsProviderProps} props
 */
export const UploadsProvider = ({ children }) => {
  const {
    storageData: { refetch },
  } = useUser();

  const [uploads, setUploads] = useState(/** @type {Upload[]} */ ([]));
  const [pages, setPages] = useState(0);
  const [count, setCount] = useState(0);
  const [isFetchingUploads, setIsFetchingUploads] = useState(false);
  const [fetchDate, setFetchDate] = useState(/** @type {number|undefined} */ (undefined));
  const [filesToUpload, setFilesToUpload] = useState(/** @type {FileProgress[]} */ ([]));
  const { initialize, updateFileProgress, progress, markFileCompleted, markFileFailed } = useUploadProgress([]);

  // Initialize files and prep for upload, to be called in useEffect
  const uploadFiles = useCallback(
    async (/** @typedef { Files } */ files) => {
      // Initializing client if necessary
      client =
        client ||
        new Web3Storage({
          token: await /** @type {Promise<string>} */ (getToken()),
          endpoint: new URL(API),
        });
      initialize(Object.values(progress.files).concat(files));
    },
    [initialize, progress.files]
  );

  // Clear completed files
  const clearUploadedFiles = useCallback(() => {
    initialize(Object.values(progress.files).filter(({ status }) => status !== STATUS.COMPLETED));
    return !!Object.values(progress.files).length;
  }, [initialize, progress.files]);

  /**
   * Callback to automatically upload when the progress.files
   * list changes and we are not currently tracking it
   */
  // TODO: Handle concurrency & multi-file upload
  useEffect(() => {
    const newFilesToUpload = Object.values(progress.files).filter(
      ({ inputFile }) => !filesToUpload.find(({ inputFile: trackedInputFile }) => trackedInputFile === inputFile)
    );

    // Iterate through each new file to upload and make the upload call
    if (!!newFilesToUpload.length) {
      setFilesToUpload(filesToUpload.concat(newFilesToUpload));

      newFilesToUpload.forEach(
        /** @param {(FileProgress)} file */
        async file => {
          try {
            await client.put([file.inputFile], {
              name: file.name,
              onStoredChunk: size => {
                updateFileProgress(file, size);
              },
            });
          } catch (error) {
            markFileFailed(file, error);
            console.error(error);
            return;
          }

          markFileCompleted(file);
          refetch();
        }
      );
    }
  }, [progress.files, markFileCompleted, markFileFailed, filesToUpload, updateFileProgress, refetch]);

  const getUploadsCallback = useCallback(
    /** @type {(args?: UploadArgs) => Promise<Upload[]>}} */
    async args => {
      setIsFetchingUploads(true);
      const { uploads, pages, count } = await getUploads(args);
      setUploads(uploads);
      setPages(pages);
      setCount(count);
      setFetchDate(Date.now());
      setIsFetchingUploads(false);

      return uploads;
    },
    [setUploads, setPages, setCount, setIsFetchingUploads]
  );

  const renameUploadHandler = useCallback(
    /** @type {(cid: string, name: string) => Promise<void>}} */
    async (cid, name) => {
      try {
        renameUpload(cid, name);
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw Error('Unknown error');
      }
      const renameUploadIndex = uploads.findIndex(upload => upload.cid === cid);
      uploads[renameUploadIndex].name = name;
      setUploads(uploads);
      return;
    },
    [uploads]
  );

  return (
    <UploadsContext.Provider
      value={
        /** @type {UploadsContextProps} */
        ({
          uploadFiles,
          deleteUpload,
          renameUpload: renameUploadHandler,
          getUploads: getUploadsCallback,
          uploads,
          pages,
          count,
          isFetchingUploads,
          fetchDate,
          uploadsProgress: progress,
          clearUploadedFiles,
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
