import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useUploads } from 'components/contexts/uploadsContext';
import UploadsContainer from '../uploadsContainer/uploadsContainer';

/**
 * @typedef {import('web3.storage').Upload} Upload
 * @typedef {import('../../contexts/uploadsContext').PinObject} PinObject
 */

/**
 * @typedef {Object} FilesManagerProps
 * @prop {string} [className]
 * @prop {any} [content]
 * @prop {boolean} hasPSAEnabled
 * @prop {() => void} onFileUpload
 */

/**
 *
 * @param {FilesManagerProps} props
 * @returns
 */
const FilesManager = ({ className, content, onFileUpload, hasPSAEnabled }) => {
  const { uploads, pinned } = useUploads();
  const { query, replace } = useRouter();

  const [currentTab, setCurrentTab] = useState('uploaded');

  // const [isUpdating, setIsUpdating] = useState(false);

  // Set current tab based on url param on load
  useEffect(() => {
    if (query.hasOwnProperty('table') && currentTab !== query?.table) {
      if (typeof query.table === 'string') {
        if (query.table === 'pinned' && pinned.length === 0) {
          delete query.table;
          replace(
            {
              query,
            },
            undefined,
            { shallow: true }
          );
          return;
        }
        setCurrentTab(query.table);
      }
    }
  }, [query, currentTab, pinned, replace]);

  const changeCurrentTab = useCallback(
    /** @type {string} */ tab => {
      setCurrentTab(tab);
      query.table = tab;

      replace(
        {
          query,
        },
        undefined,
        { shallow: true }
      );
    },
    [setCurrentTab, query, replace]
  );

  const getFilesTotal = type => {
    switch (type) {
      case 'uploaded':
        return uploads.length;
      case 'pinned':
        return pinned.length;
      default:
        return '';
    }
  };

  const renderTab = type => {
    return type === 'uploaded' ? (
      <UploadsContainer content={content} onFileUpload={onFileUpload} />
    ) : (
      <div>Pins tab</div>
    );
  };

  return (
    <div
      className={clsx(
        'section files-manager-container',
        className
        // isUpdating && 'disabled'
      )}
    >
      {hasPSAEnabled && (
        <div className="upload-pinned-selector">
          {content?.tabs.map(tab => (
            <div key={tab.file_type} className="filetype-tab">
              <button
                disabled={tab.file_type === 'pinned' && pinned.length === 0}
                className={clsx('tab-button', currentTab === tab.file_type ? 'selected' : '')}
                onClick={() => changeCurrentTab(tab.file_type)}
              >
                <span>{tab.button_text}</span>
                <span>{` (${getFilesTotal(tab.file_type)})`}</span>
              </button>
            </div>
          ))}
        </div>
      )}
      {renderTab(currentTab)}
    </div>
  );
};

export default FilesManager;
