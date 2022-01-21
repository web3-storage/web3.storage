import clsx from 'clsx';
import filesize from 'filesize';
import React, { useCallback, useEffect, useState } from 'react';
// @ts-ignore
import { useRouter } from 'next/router';
import { Upload } from 'web3.storage';

import FileRowItem, { PinStatus } from './fileRowItem';
import SearchIcon from 'assets/icons/search';
import RefreshIcon from 'assets/icons/refresh';
import countly from 'lib/countly';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Filterable from 'ZeroComponents/filterable/filterable';
import Sortable, { SortType, SortDirection } from 'ZeroComponents/sortable/sortable';
import Pagination from 'ZeroComponents/pagination/pagination';
import { formatTimestamp } from 'lib/utils';
import { useUploads } from 'components/contexts/uploadsContext';

type FilesManagerProps = {
  className?: string;
};

const FilesManager = ({ className }: FilesManagerProps) => {
  const { uploads: files, fetchDate, getUploads, isFetchingUploads, deleteUpload } = useUploads();
  const {
    query: { filter },
  } = useRouter();
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [sortedFiles, setSortedFiles] = useState(filteredFiles);
  const [paginatedFiles, setPaginatedFiles] = useState(sortedFiles);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [keyword, setKeyword] = useState(filter);

  const [selectedFiles, setSelectedFiles] = useState<Upload[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initial fetch on component load
  useEffect(() => {
    if (!fetchDate && !isFetchingUploads) {
      getUploads();
    }
  }, [fetchDate, getUploads, isFetchingUploads]);

  const onFileUploead = useCallback(() => {
    window.alert('Upload a file');
  }, []);

  const onSelectAllToggle = useCallback(
    e => {
      const filesToSelect = paginatedFiles.filter(file => !selectedFiles.some(fileSelected => fileSelected === file));

      if (!filesToSelect.length) {
        return setSelectedFiles([]);
      }

      return setSelectedFiles(selectedFiles.concat(filesToSelect));
    },
    [selectedFiles, setSelectedFiles, paginatedFiles]
  );

  const onFileSelect = useCallback(
    (file: Upload) => {
      const selectedIndex = selectedFiles.findIndex(fileSelected => fileSelected === file);
      if (selectedIndex !== -1) {
        selectedFiles.splice(selectedIndex, 1);

        return setSelectedFiles([...selectedFiles]);
      }

      setSelectedFiles([...selectedFiles, file]);
    },
    [selectedFiles, setSelectedFiles]
  );

  const onDeleteSelected = useCallback(async () => {
    if (!window.confirm('Are you sure? Deleted files cannot be recovered!')) {
      countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
        ui: countly.ui.FILES,
        totalDeleted: 0,
      });
      return;
    }

    setIsDeleting(true);
    await Promise.all(selectedFiles.map(({ cid }) => deleteUpload(cid)));

    countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
      ui: countly.ui.FILES,
      totalDeleted: selectedFiles.length,
    });

    setIsDeleting(false);
    setSelectedFiles([]);

    getUploads();
  }, [selectedFiles, deleteUpload, setIsDeleting, getUploads]);

  return (
    <div className={clsx('section files-manager-container', className, isDeleting && 'disabled')}>
      <div className="files-manager-header">
        <span>Files</span>
        <Filterable
          className="files-manager-search"
          items={files}
          icon={<SearchIcon />}
          filterKeys={['name', 'cid']}
          placeholder="Search for a file"
          queryParam="filter"
          onChange={setFilteredFiles}
          onValueChange={setKeyword}
        />
        <button
          className={clsx('refresh', isFetchingUploads && 'disabled')}
          onClick={useCallback(_ => getUploads(), [getUploads])}
        >
          <RefreshIcon />
          Refresh
        </button>
        <Sortable
          items={filteredFiles}
          staticLabel={'Sort by'}
          options={[
            {
              label: 'Alphabetical A-Z',
              key: 'name',
              value: 'a-z',
              direction: SortDirection.ASC,
              compareFn: SortType.ALPHANUMERIC,
            },
            {
              label: 'Alphabetical Z-A',
              key: 'name',
              value: 'z-A',
              direction: SortDirection.DESC,
              compareFn: SortType.ALPHANUMERIC,
            },
            {
              label: 'Most Recently Added',
              value: 'newest',
              compareFn: items => items.sort((a, b) => a['created'].localeCompare(b['created'])),
            },
            {
              label: 'Least Recently Added',
              value: 'oldest',
              compareFn: items => items.sort((a, b) => b['created'].localeCompare(a['created'])),
            },
            {
              label: 'Largest size',
              value: 'largest',
              compareFn: items => items.sort((a, b) => b.dagSize - a.dagSize),
            },
            {
              label: 'Smallest size',
              value: 'smallest',
              compareFn: items => items.sort((a, b) => a.dagSize - b.dagSize),
            },
            /** TODO: Add file type sorting if available
             * {
             * label: 'File type',
             * value: 'fileType',
             * compareFn: items => items.sort((a, b) => b.dagSize < a.dagSize),
             * },
             */
            /** TODO: Confirm what miner sorting is
             * {
             * label: 'Miner',
             * value: 'miner',
             * compareFn: items => items.sort((a, b) => b.dagSize < a.dagSize),
             * },
             */
          ]}
          value="a-z"
          queryParam="order"
          onChange={setSortedFiles}
        />
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
        isSelected={
          !!selectedFiles.length &&
          paginatedFiles.every(file => selectedFiles.find(fileSelected => file === fileSelected)) &&
          !!fetchDate
        }
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
          paginatedFiles.map(item => (
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
              highlight={{ target: 'name', text: keyword }}
              numberOfPins={item.pins.length}
              isSelected={!!selectedFiles.find(fileSelected => fileSelected === item)}
            />
          ))
        )}
      </div>
      {!!files.length && (
        <div className="files-manager-footer">
          <button className={clsx('delete', !selectedFiles.length && 'disabled')} onClick={onDeleteSelected}>
            Delete Selected
          </button>
          <Pagination
            items={sortedFiles}
            itemsPerPage={itemsPerPage}
            visiblePages={1}
            queryParam="page"
            onChange={setPaginatedFiles}
          />
          <Dropdown
            className="files-manager-result-dropdown"
            value="10"
            options={[
              { label: 'View 10 Results', value: '10' },
              { label: 'View 20 Results', value: '20' },
              { label: 'View 50 Results', value: '50' },
              { label: 'View 100 Results', value: '100' },
            ]}
            queryParam="items"
            onChange={value => setItemsPerPage(value)}
          />
        </div>
      )}
    </div>
  );
};

export default FilesManager;
