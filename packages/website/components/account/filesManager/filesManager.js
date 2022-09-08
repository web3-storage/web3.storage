import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useUploads } from 'components/contexts/uploadsContext';
import { Tabs, TabItem } from 'components/tabs/tabs';

// import UploadsContainer from '../uploadsContainer/uploadsContainer';

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

  const upload_types = {
    UPLOADED: 'uploaded',
    PINNED: 'pinned',
  };

  const uploadedTypeContainerComponentMap = {};
  uploadedTypeContainerComponentMap[upload_types.UPLOADED] = <span> uploads here</span>; // <UploadsContainer content={content} onFileUpload={onFileUpload} />,
  uploadedTypeContainerComponentMap[upload_types.PINNED] = <span> pins here</span>; // <UploadsContainer content={content} onFileUpload={onFileUpload} />,

  const [currentTab, setCurrentTab] = useState(upload_types.UPLOADED);

  // const [isUpdating, setIsUpdating] = useState(false);

  // Set current tab based on url param on load
  useEffect(() => {
    if (
      query.hasOwnProperty('table') &&
      typeof query.table === 'string' &&
      // Object.values(upload_types).includes(query.table) &&
      currentTab !== query.table
    ) {
      if (query.table === 'pinned' && !hasPSAEnabled) {
        // Remove the pinned param if this is not enabled for the account.
        delete query.table;
        replace({ query }, undefined, { shallow: true });
        return;
      }
      setCurrentTab(query.table);
    }
  }, [replace, query, currentTab, hasPSAEnabled]);

  const changeCurrentTab = useCallback(
    /** @type {string} */
    tab => {
      console.log('TAB', tab);
      setCurrentTab(tab);
      query.table = tab;

      replace({ query }, undefined, { shallow: true });
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

  return (
    <div className={clsx('section files-manager-container', className)}>
      {hasPSAEnabled && (
        <div className="upload-pinned-selector">
          <Tabs onValueChange={changeCurrentTab}>
            {content?.tabs.map(tab => (
              <TabItem
                key={tab.upload_type}
                value={tab.upload_type}
                label={`${tab.button_text} (${getFilesTotal(tab.upload_type)})`}
              >
                {uploadedTypeContainerComponentMap[tab.upload_type]}
              </TabItem>
            ))}
            {/* <div key={tab.upload_type} className="filetype-tab">
                <button
                  disabled={tab.upload_type === 'pinned' && pinned.length === 0}
                  className={clsx('tab-button', currentTab === tab.upload_type ? 'selected' : '')}
                  onClick={() => changeCurrentTab(tab.upload_type)}
                >
                  <span>{tab.button_text}</span>
                  <span>{` (${getFilesTotal(tab.upload_type)})`}</span>
                </button>
              </div> */}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default FilesManager;
