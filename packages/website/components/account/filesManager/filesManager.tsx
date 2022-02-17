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
import Button from 'components/button/button';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Filterable from 'ZeroComponents/filterable/filterable';
import Sortable from 'ZeroComponents/sortable/sortable';
import Pagination from 'ZeroComponents/pagination/pagination';
import { formatTimestamp } from 'lib/utils';
import { useUploads } from 'components/contexts/uploadsContext';

type FilesManagerProps = {
  className?: string;
  content?: any;
  onFileUpload: () => void;
};

const FilesManager = ({ className, content, onFileUpload }: FilesManagerProps) => {
  const { uploads: files, fetchDate, getUploads, isFetchingUploads, deleteUpload, renameUpload } = useUploads();
  const {
    query: { filter },
  } = useRouter();
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [sortedFiles, setSortedFiles] = useState(filteredFiles);
  const [paginatedFiles, setPaginatedFiles] = useState(sortedFiles);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [keyword, setKeyword] = useState(filter);

  const [selectedFiles, setSelectedFiles] = useState<Upload[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [nameEditingId, setNameEditingId] = useState();
  const fileRowLabels = content?.table.file_row_labels;
  const fileDeleteWarning = content?.ui.delete.alert;

  // Initial fetch on component load
  useEffect(() => {
    if (!fetchDate && !isFetchingUploads) {
      getUploads();
    }
  }, [fetchDate, getUploads, isFetchingUploads]);

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
    if (!window.confirm(fileDeleteWarning)) {
      countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
        ui: countly.ui.FILES,
        totalDeleted: 0,
      });
      return;
    }

    setIsUpdating(true);
    await Promise.all(selectedFiles.map(({ cid }) => deleteUpload(cid)));

    countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
      ui: countly.ui.FILES,
      totalDeleted: selectedFiles.length,
    });

    setIsUpdating(false);
    setSelectedFiles([]);

    getUploads();
  }, [selectedFiles, deleteUpload, setIsUpdating, getUploads, fileDeleteWarning]);

  const onDeleteSingle = useCallback(
    async cid => {
      if (!window.confirm(fileDeleteWarning)) {
        countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
          ui: countly.ui.FILES,
          totalDeleted: 0,
        });
        return;
      }

      setIsUpdating(true);
      deleteUpload(cid);

      countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
        ui: countly.ui.FILES,
        totalDeleted: 1,
      });

      setIsUpdating(false);
      setSelectedFiles([]);

      getUploads();
    },
    [deleteUpload, setIsUpdating, getUploads, fileDeleteWarning]
  );

  //
  const onEditToggle = useCallback(
    targetCID => async (newFileName: string) => {
      setNameEditingId(targetCID !== nameEditingId ? targetCID : undefined);

      const fileTarget = files.find(({ cid }) => cid === targetCID);
      if (!!newFileName && newFileName !== fileTarget.name) {
        setIsUpdating(true);
        await renameUpload(nameEditingId, newFileName);
        fileTarget.name = newFileName;
        setIsUpdating(false);
      }
    },
    [renameUpload, files, nameEditingId]
  );

  return (
    <div className={clsx('section files-manager-container', className, isUpdating && 'disabled')}>
      <div className="files-manager-header">
        <span>{content?.heading}</span>
        <Filterable
          className="files-manager-search"
          items={files}
          icon={<SearchIcon />}
          filterKeys={['name', 'cid']}
          placeholder={content?.ui.filter_placeholder}
          queryParam="filter"
          onChange={setFilteredFiles}
          onValueChange={setKeyword}
        />
        <button
          className={clsx('refresh', isFetchingUploads && 'disabled')}
          onClick={useCallback(_ => getUploads(), [getUploads])}
        >
          <RefreshIcon />
          <span>{content?.ui.refresh}</span>
        </button>
        <Sortable
          items={filteredFiles}
          staticLabel={content?.ui.sortby.label}
          options={content?.ui.sortby.options}
          value="a-z"
          queryParam="order"
          onChange={setSortedFiles}
        />
      </div>
      <FileRowItem
        onSelect={onSelectAllToggle}
        date={fileRowLabels.date.label}
        name={fileRowLabels.name.label}
        cid={fileRowLabels.cid.label}
        status={fileRowLabels.status.label}
        storageProviders={fileRowLabels.storage_providers.label}
        size={fileRowLabels.size.label}
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
            {content?.table.message}
            {'\u00A0'}
            <Button
              onClick={onFileUpload}
              variant={content?.table.cta.theme}
              tracking={{
                ui: countly.ui[content?.table.cta.ui],
                action: content?.table.cta.action,
                data: { isFirstFile: true },
              }}
            >
              {content?.table.cta.text}
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
                <span key={deal.dealId}>
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
              // TODO: Remove hardcoded highlight when hooked up, resolve temporary type fix for array of strings
              highlight={{ target: 'name', text: keyword?.toString() || '' }}
              numberOfPins={item.pins.length}
              isSelected={!!selectedFiles.find(fileSelected => fileSelected === item)}
              onDelete={() => onDeleteSingle(item.cid)}
              isEditingName={item.cid === nameEditingId}
              onEditToggle={onEditToggle(item.cid)}
            />
          ))
        )}
      </div>
      {!!files.length && (
        <div className="files-manager-footer">
          <button className={clsx('delete', !selectedFiles.length && 'disabled')} onClick={onDeleteSelected}>
            {content?.ui.delete.text}
          </button>
          <Pagination
            className="files-manager-pagination"
            items={sortedFiles}
            itemsPerPage={itemsPerPage || 10}
            visiblePages={1}
            queryParam="page"
            onChange={setPaginatedFiles}
          />
          <Dropdown
            className="files-manager-result-dropdown"
            value={content?.ui.results.options[0].value}
            options={content?.ui.results.options}
            queryParam="items"
            onChange={value => setItemsPerPage(value)}
          />
        </div>
      )}
    </div>
  );
};

export default FilesManager;
