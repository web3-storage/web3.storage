import clsx from 'clsx';
import { useCallback } from 'react';

import SearchIcon from 'assets/icons/search';
import Button, { ButtonVariant } from 'components/button/button';

type FilesManagerProps = {
  className?: string;
};

const FilesManager = ({ className }: FilesManagerProps) => {
  // TODO: Pull files from redux to populate
  const files = [];
  const onFileUploead = useCallback(() => {
    window.alert('Upload a file');
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
      <div className="files-manager-row">
        <span className="file-date">Date</span>
        <span className="file-name">Name</span>
        <span className="file-cid">CID</span>
        <span className="file-pin-status">Pin Status</span>
        <span className="file-storage-providers">Storage Providers</span>
        <span className="file-size">Size</span>
      </div>
      <div className="files-manager-table-header-divider" />
      <div className="files-manager-table-content">
        {!files.length ? (
          <span className="files-manager-upload-cta">
            You don’t have any API Tokens created yet.{'\u00A0'}
            <Button onClick={onFileUploead} variant={ButtonVariant.TEXT}>
              Create your first API Token.
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
