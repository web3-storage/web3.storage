import clsx from 'clsx';

import SearchIcon from 'assets/icons/search';

type FilesManagerProps = {
  className?: string;
};

const FilesManager = ({ className }: FilesManagerProps) => {
  return (
    <div className={clsx('section files-manager-container', className)}>
      <div className="files-manager-header">
        Files
        <div className="files-manager-search">
          <SearchIcon />
          <input placeholder="Search for a file" />
        </div>
      </div>
      <div className="files-manager-row files-manager-table-header">
        <span className="file-date">Date</span>
        <span className="file-name">Name</span>
        <span className="file-cid">CID</span>
        <span className="file-pin-status">Pin Status</span>
        <span className="file-storage-providers">Storage Providers</span>
        <span className="file-size">Size</span>
      </div>
    </div>
  );
};

export default FilesManager;
