import clsx from 'clsx';
import React, { useCallback } from 'react';

import SearchIcon from 'assets/icons/search';
import countly from 'lib/countly';
import CheckIcon from 'assets/icons/check';
import InfoAIcon from 'assets/icons/infoA';
import InfoBIcon from 'assets/icons/infoB';
import Button, { ButtonVariant } from 'components/button/button';

type FilesManagerProps = {
  className?: string;
};

const Info = ({ content, icon = null }: { content: string; icon?: React.ReactNode }) => (
  <div className="info-container">
    {icon || <InfoAIcon />}
    <span className="info-tooltip" dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);

const FileRowItem = ({
  className = '',
  date,
  name,
  cid,
  available,
  status,
  storageProviders,
  size,
  onSelect,
  isHeader = false,
}) => {
  return (
    <div className={clsx('files-manager-row', className, isHeader && 'files-manager-row-header')}>
      <span className="file-select">
        <input type="checkbox" id={`${name}-select`} onChange={onSelect} />
        <CheckIcon className="check" />
      </span>
      <span className="file-date">{date}</span>
      <span className="file-name">{name}</span>
      <span className="file-cid">
        {cid}
        {isHeader && (
          <Info content="The content identifier for a file or a piece of data. <a href='https://docs.web3.storage/concepts/content-addressing/' target='_blank' rel='noreferrer'>Learn more</a>" />
        )}
      </span>
      <span className="file-availability">
        {available}
        {isHeader && (
          <Info content="Reports the status of a file or piece of data stored on Web3.Storage’s IPFS nodes." />
        )}
      </span>
      <span className="file-pin-status">
        {status}
        {isHeader ? (
          <Info content="Reports the status of a file or piece of data stored on Web3.Storage’s IPFS nodes." />
        ) : (
          status === 'pinned' && <Info icon={<InfoBIcon />} content="The upload is fully pinned on 3 IPFS nodes." />
        )}
      </span>
      <span className="file-storage-providers">
        {storageProviders}
        {isHeader && (
          <Info content="Service providers offering storage capacity to the Filecoin network. <a href='https://docs.web3.storage/concepts/decentralized-storage/' target='_blank' rel='noreferrer'>Learn more</a>" />
        )}
      </span>
      <span className="file-size">{size}</span>
    </div>
  );
};

const FilesManager = ({ className }: FilesManagerProps) => {
  // TODO: Pull files from redux to populate
  const files = [];
  const onFileUploead = useCallback(() => {
    window.alert('Upload a file');
  }, []);

  const onSelectAllToggle = useCallback(e => {
    window.alert(`Select all toggle ${e.currentTarget.value}`);
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
        available="Available"
        status="Status"
        storageProviders="Storage Providers"
        size="Size"
        isHeader
      />
      <div className="files-manager-table-content">
        {!files.length ? (
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
          <div>TODO: Files Content</div>
        )}
      </div>
    </div>
  );
};

export default FilesManager;
