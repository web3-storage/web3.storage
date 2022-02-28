import React, { useCallback, useState, useEffect } from 'react';
import { Web3Storage } from 'web3.storage';

import { API, deleteUpload, getToken, getUploads, renameUpload } from 'lib/api';
import { useUploadProgress } from './uploadProgressContext';

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
 * @typedef {Object} UploadsContextProps
 * @property {Upload[]} uploads Uploads available in this account
 * @property {(cid: string) => Promise<void>} deleteUpload Method to delete an existing upload
 * @property {(cid: string, name: string)=>Promise<void>} renameUpload Method to rename an existing upload
 * @property {(args?: UploadArgs) => Promise<Upload[]>} getUploads Method that refetches list of uploads based on certain params
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
  const [uploads, setUploads] = useState(/** @type {Upload[]} */ ([]));
  const [isFetchingUploads, setIsFetchingUploads] = useState(false);
  const [fetchDate, setFetchDate] = useState(/** @type {number|undefined} */ (undefined));
  const [filesToUpload, setFilesToUpload] = useState(/** @type {FileProgress[]} */ ([]));
  const { initialize, updateFileProgress, progress, markFileCompleted, markFileFailed } = useUploadProgress([]);

  // Initialize files and prep for upload, to be called in useEffect
  const uploadFiles = useCallback(
    /** @param {Files} file */
    async files => {
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
        }
      );
    }
  }, [progress.files, markFileCompleted, markFileFailed, filesToUpload, updateFileProgress]);

  const getUploadsCallback = useCallback(
    /** @type {(args?: UploadArgs) => Promise<Upload[]>}} */
    async (
      args = {
        size: 1000,
        before: new Date().toISOString(),
      }
    ) => {
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
          uploadFiles,
          deleteUpload,
          renameUpload,
          getUploads: getUploadsCallback,
          uploads,
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
