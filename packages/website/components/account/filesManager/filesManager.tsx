import clsx from 'clsx';
import filesize from 'filesize';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Upload } from 'web3.storage';

import SearchIcon from 'assets/icons/search';
import CopyIcon from 'assets/icons/copy';
import PencilIcon from 'assets/icons/pencil';
import countly from 'lib/countly';
import CheckIcon from 'assets/icons/check';
import InfoAIcon from 'assets/icons/infoA';
import InfoBIcon from 'assets/icons/infoB';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import { addTextToClipboard, formatTimestamp, truncateString } from 'lib/utils';
import { useUploads } from 'components/contexts/uploadsContext';

type FilesManagerProps = {
  className?: string;
};

const Info = ({ content, icon = null }: { content: string; icon?: React.ReactNode }) => (
  <div className="info-container">
    {icon || <InfoAIcon />}
    <span className="info-tooltip" dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);

enum PinStatus {
  PINNED = 'Pinned',
  PINNING = 'Pinning',
  PIN_QUEUED = 'PinQueued',
  QUEUING = 'Queuing...',
}

const FileRowItem = ({
  className = '',
  date,
  name,
  cid,
  status,
  storageProviders,
  size,
  onSelect,
  numberOfPins,
  isHeader = false,
}: {
  className?: string;
  date: string;
  name: string;
  cid: string;
  status: string;
  storageProviders: string | React.ReactNode[];
  size: string;
  onSelect: (e: any) => void;
  numberOfPins?: number;
  isHeader?: boolean;
}) => {
  const statusTooltip = useMemo(
    () =>
      ({
        [PinStatus.QUEUING]: 'The upload has been received or is in progress and has not yet been queued for pinning.',
        [PinStatus.PIN_QUEUED]: 'The upload has been received and is in the queue to be pinned.',
        [PinStatus.PINNING]: 'The upload is being replicated to multiple IPFS nodes.',
        [PinStatus.PINNED]: `The upload is fully pinned on ${numberOfPins} IPFS nodes.`,
      }[status]),
    [numberOfPins, status]
  );

  const [isEditingName, setIsEditingName] = useState(false);

  return (
    <div className={clsx('files-manager-row', className, isHeader && 'files-manager-row-header')}>
      <span className="file-select">
        <input type="checkbox" id={`${name}-select`} onChange={onSelect} />
        <CheckIcon className="check" />
      </span>
      <span className="file-date">{date}</span>
      <span className={clsx(isEditingName && 'isEditingName', 'file-name')}>
        {!isEditingName ? (
          name
        ) : (
          <span>
            <textarea defaultValue={name} />
          </span>
        )}

        {!isHeader && <PencilIcon onClick={() => setIsEditingName(!isEditingName)} />}
      </span>
      <span className="file-cid" title={cid}>
        {useMemo(() => truncateString(cid, 6, '...', 'double'), [cid])}
        {isHeader ? (
          <Info content="The content identifier for a file or a piece of data. <a href='https://docs.web3.storage/concepts/content-addressing/' target='_blank' rel='noreferrer'>Learn more</a>" />
        ) : (
          <CopyIcon
            className="copy-icon"
            onClick={() => {
              console.log('shiet');
              addTextToClipboard(cid);
            }}
          />
        )}
      </span>
      <span className="file-availability">Available</span>
      <span className="file-pin-status">
        {status}
        {isHeader ? (
          <Info content="Reports the status of a file or piece of data stored on Web3.Storage’s IPFS nodes." />
        ) : (
          statusTooltip && <Info icon={<InfoBIcon />} content="The upload is fully pinned on 3 IPFS nodes." />
        )}
      </span>
      <span className="file-storage-providers">
        {storageProviders}
        {isHeader ? (
          <Info content="Service providers offering storage capacity to the Filecoin network. <a href='https://docs.web3.storage/concepts/decentralized-storage/' target='_blank' rel='noreferrer'>Learn more</a>" />
        ) : (
          !storageProviders.length && (
            <>
              Queuing...
              <Info content="The content from this upload is being aggregated for storage on Filecoin. Filecoin deals will be active within 48 hours of upload." />
            </>
          )
        )}
      </span>
      <span className="file-size">{size}</span>
    </div>
  );
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
              numberOfPins={item.pins.length}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FilesManager;
