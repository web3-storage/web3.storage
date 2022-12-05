import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import CheckIcon from 'assets/icons/check';
import { useUploads } from 'components/contexts/uploadsContext';
import { usePinRequests } from 'components/contexts/pinRequestsContext';
import { useUser } from 'components/contexts/userContext';
import UploadsTable from './uploadsTable';
import PinRequestsTable from './pinRequestsTable';

/**
 * @typedef {import('web3.storage').Upload} Upload
 * @typedef {import('../../contexts/uploadsContext').PinObject} PinObject
 */

/**
 * @typedef {Object} FilesManagerProps
 * @prop {string} [className]
 * @prop {any} [content]
 * @prop {() => void} onFileUpload
 */

/**
 *
 * @param {FilesManagerProps} props
 * @returns
 */
const FilesManager = ({ className, content, onFileUpload }) => {
  const { info: userInfo } = useUser();
  const { count: uploadsCount } = useUploads();
  const { count: pinRequestsCount } = usePinRequests();
  const { query, replace } = useRouter();

  const [currentTab, setCurrentTab] = useState('uploaded');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCheckOverlay, setShowCheckOverlay] = useState(false);

  // Set current tab based on url param on load
  useEffect(() => {
    if (query.hasOwnProperty('table') && currentTab !== query?.table && typeof query.table === 'string') {
      if (query.table === 'pinned') {
        if (userInfo) {
          if (!userInfo.tags?.HasPsaAccess) {
            delete query.table;
            replace(
              {
                query,
              },
              undefined,
              { shallow: true }
            );
          } else {
            setCurrentTab(query.table);
          }
        }
      } else {
        setCurrentTab(query.table);
      }
    }
  }, [query, currentTab, userInfo, replace]);

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
        return uploadsCount;
      case 'pinned':
        return pinRequestsCount;
      default:
        return '';
    }
  };

  const showCheckOverlayHandler = useCallback(() => {
    setShowCheckOverlay(true);
    setTimeout(() => {
      setShowCheckOverlay(false);
    }, 500);
  }, [setShowCheckOverlay]);

  return (
    <div className={clsx('section files-manager-container', className, isUpdating && 'disabled')}>
      {userInfo?.tags?.HasPsaAccess && (
        <div className="upload-pinned-selector">
          {content?.tabs.map(tab => (
            <div key={tab.file_type} className="filetype-tab">
              <button
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
      <UploadsTable
        content={content}
        hidden={currentTab !== 'uploaded'}
        onFileUpload={onFileUpload}
        onUpdatingChange={setIsUpdating}
        showCheckOverlay={showCheckOverlayHandler}
      />
      {userInfo?.tags?.HasPsaAccess && (
        <PinRequestsTable
          content={content}
          hidden={currentTab !== 'pinned'}
          onUpdatingChange={setIsUpdating}
          showCheckOverlay={showCheckOverlayHandler}
        />
      )}
      <div className={clsx('files-manager-overlay', showCheckOverlay ? 'show' : '')}>
        <div className="files-manager-overlay-check">
          <CheckIcon />
        </div>
      </div>
    </div>
  );
};

export default FilesManager;
