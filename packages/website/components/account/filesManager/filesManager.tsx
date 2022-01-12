import clsx from 'clsx';
import filesize from 'filesize';
import React, { useCallback, useEffect } from 'react';
// @ts-ignore
import { Upload } from 'web3.storage';

import FileRowItem, { PinStatus } from './fileRowItem';
import SearchIcon from 'assets/icons/search';
import countly from 'lib/countly';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import { formatTimestamp } from 'lib/utils';
import { useUploads } from 'components/contexts/uploadsContext';

type FilesManagerProps = {
  className?: string;
};

const FilesManager = ({ className }: FilesManagerProps) => {
  const { uploads: files, fetchDate, getUploads, isFetchingUploads } = useUploads();

  // Initial fetch on component load
  useEffect(() => {
    if (!fetchDate && !isFetchingUploads) {
      getUploads();
    }
  }, [fetchDate, getUploads, isFetchingUploads]);

  const onFileUploead = useCallback(() => {
    window.alert('Upload a file');
  }, []);

  const onSelectAllToggle = useCallback(e => {
    window.alert(`Select all toggle ${e.currentTarget.value}`);
  }, []);

  const onFileSelect = useCallback((file: Upload) => {
    window.alert(`Select file:${file.name}`);
  }, []);

  return (
    <div className={clsx('section files-manager-container', className)}>
      <div className="files-manager-header">
        Files
        <div className="files-manager-search">
          <input placeholder="Search for a file" />
          <SearchIcon />
        </div>
      </div>
      <FileRowItem
        onSelect={onSelectAllToggle}
        date="Date"
        name="Name"
        cid="CID"
        status="Status"
        storageProviders="Storage Providers"
        size="Size"
        isHeader
      />
      <div className="files-manager-table-content">
        {isFetchingUploads || !fetchDate ? (
          <Loading className={'files-loading-spinner'} />
        ) : !files.length ? (
          <span className="files-manager-upload-cta">
            You don’t have any files uploaded yet.{'\u00A0'}
            <Button
              onClick={onFileUploead}
              variant={ButtonVariant.TEXT}
              tracking={{
                ui: countly.ui.FILES,
                action: 'Upload File',
                data: { isFirstFile: true },
              }}
            >
              Upload your first file
            </Button>
          </span>
        ) : (
          files.map(item => (
            <FileRowItem
              key={item.cid}
              onSelect={() => onFileSelect(item)}
              date={formatTimestamp(item.created)}
              name={item.name}
              cid={item.cid}
              status={
                Object.values(PinStatus).find(status => item.pins.some(pin => status === pin.status)) ||
                PinStatus.QUEUING
              }
              storageProviders={item.deals.map((deal, indx, deals) => (
                <span>
                  <a
                    className="underline"
                    href={`https://filfox.info/en/deal/${deal.dealId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {`${deal.storageProvider}`}
                  </a>
                  {indx !== deals.length - 1 && ', '}
                </span>
              ))}
              size={filesize(item.dagSize)}
              // TODO: Remove hardcoded highlight when hooked up
              highlight={{ target: 'name', text: 'coil' }}
              numberOfPins={item.pins.length}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FilesManager;
