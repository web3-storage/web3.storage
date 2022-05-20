import clsx from 'clsx';
import filesize from 'filesize';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import FileRowItem, { PinStatus } from './fileRowItem';
import SearchIcon from 'assets/icons/search';
import RefreshIcon from 'assets/icons/refresh';
import countly from 'lib/countly';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Filterable from 'ZeroComponents/filterable/filterable';
import Sortable from 'ZeroComponents/sortable/sortable';
import Pagination from 'ZeroComponents/pagination/pagination';
import Modal from 'modules/zero/components/modal/modal';
import GradientBackground from '../../gradientbackground/gradientbackground.js';
import CloseIcon from 'assets/icons/close';
import { formatTimestamp } from 'lib/utils';
import { useUploads } from 'components/contexts/uploadsContext';
import { useUser } from 'components/contexts/userContext';
import CheckIcon from 'assets/icons/check';

const defaultQueryOrder = 'newest';

/**
 * @typedef {import('web3.storage').Upload} Upload
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
  const { uploads: allFiles, fetchDate, getUploads, isFetchingUploads, deleteUpload, renameUpload } = useUploads();
  const {
    query: { filter },
    query,
    replace,
  } = useRouter();
  const {
    storageData: { refetch },
  } = useUser();

  // memoize this ?
  const filesByType = {
    uploaded: allFiles.filter(file => file.pins.length === 0),
    pinned: allFiles.filter(file => file.pins.length !== 0),
  };

  const [currentTab, setCurrentTab] = useState('uploaded');
  const [files, setFiles] = useState(allFiles);
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [sortedFiles, setSortedFiles] = useState(filteredFiles);
  const [paginatedFiles, setPaginatedFiles] = useState(sortedFiles);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [keyword, setKeyword] = useState(filter);
  const [deleteSingleCid, setDeleteSingleCid] = useState('');
  const [showCheckOverlay, setShowCheckOverlay] = useState(false);
  const deleteModalState = useState(false);
  const queryOrderRef = useRef(query.order);

  const [selectedFiles, setSelectedFiles] = useState(/** @type {Upload[]} */ ([]));
  const [isUpdating, setIsUpdating] = useState(false);
  const [nameEditingId, setNameEditingId] = useState();
  const fileRowLabels = content?.table.file_row_labels;

  // Initial fetch on component load
  useEffect(() => {
    if (!fetchDate && !isFetchingUploads) {
      getUploads();
    }
  }, [fetchDate, getUploads, isFetchingUploads]);

  // Set displayed files based on tab selection: 'uploaded' or 'pinned'
  useEffect(() => {
    if (currentTab === 'uploaded') {
      setFiles(allFiles.filter(file => file.pins.length === 0));
    } else if (currentTab === 'pinned') {
      setFiles(allFiles.filter(file => file.pins.length !== 0));
    }
  }, [allFiles, currentTab]);

  // Method to reset the pagination every time query order changes
  useEffect(() => {
    if (
      (!queryOrderRef.current && !!query.order && query.order !== defaultQueryOrder) ||
      (!!queryOrderRef.current && !!query.order && query.order !== queryOrderRef.current)
    ) {
      delete query.page;

      replace(
        {
          query,
        },
        undefined,
        { shallow: true }
      );

      const scrollToElement = document.querySelector('.account-files-manager');
      scrollToElement?.scrollIntoView(true);

      queryOrderRef.current = query.order;
    }
  }, [query.order, query, replace]);

  const changeCurrentTab = useCallback(
    /** @type {string} */ tab => {
      setCurrentTab(tab);
    },
    [setCurrentTab]
  );

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
    /** @type {Upload} */ file => {
      const selectedIndex = selectedFiles.findIndex(fileSelected => fileSelected === file);
      if (selectedIndex !== -1) {
        selectedFiles.splice(selectedIndex, 1);
        return setSelectedFiles([...selectedFiles]);
      }

      setSelectedFiles([...selectedFiles, file]);
    },
    [selectedFiles, setSelectedFiles]
  );

  const closeDeleteModal = useCallback(() => {
    deleteModalState[1](false);
    countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
      ui: countly.ui.FILES,
      totalDeleted: 0,
    });
  }, [deleteModalState]);

  const onDeleteSelected = useCallback(async () => {
    setIsUpdating(true);

    if (deleteSingleCid !== '') {
      await deleteUpload(deleteSingleCid);
    } else {
      await Promise.all(selectedFiles.map(({ cid }) => deleteUpload(cid)));
    }

    countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
      ui: countly.ui.FILES,
      totalDeleted: selectedFiles.length,
    });

    setIsUpdating(false);
    setSelectedFiles([]);

    getUploads();
    setDeleteSingleCid('');
    deleteModalState[1](false);
    refetch();
  }, [deleteSingleCid, selectedFiles, getUploads, deleteModalState, deleteUpload, refetch]);

  const onDeleteSingle = useCallback(
    async cid => {
      deleteModalState[1](true);
      setDeleteSingleCid(cid);
    },
    [deleteModalState]
  );

  const onEditToggle = useCallback(
    targetCID => async (/** @type {string|undefined} */ newFileName) => {
      setNameEditingId(targetCID !== nameEditingId ? targetCID : undefined);

      const fileTarget = files.find(({ cid }) => cid === targetCID);
      if (!!fileTarget && !!newFileName && newFileName !== fileTarget.name) {
        setIsUpdating(true);
        await renameUpload(targetCID, newFileName);
        fileTarget.name = newFileName;
        setIsUpdating(false);
      }
    },
    [renameUpload, files, nameEditingId]
  );

  const showCheckOverlayHandler = useCallback(() => {
    setShowCheckOverlay(true);
    setTimeout(() => {
      setShowCheckOverlay(false);
    }, 500);
  }, [setShowCheckOverlay]);

  const refreshHandler = useCallback(() => {
    getUploads();
    showCheckOverlayHandler();
  }, [getUploads, showCheckOverlayHandler]);

  return (
    <div className={clsx('section files-manager-container', className, isUpdating && 'disabled')}>
      <div className="files-manager-header">
        <div className="grid-noGutter">
          <div className="col-12">
            <div className="upload-pinned-selector">
              {content?.tabs.map(tab => (
                <div key={tab.file_type} className="filetype-tab">
                  <button
                    className={clsx('tab-button', currentTab === tab.file_type ? 'selected' : '')}
                    onClick={() => changeCurrentTab(tab.file_type)}
                  >
                    {tab.text + ` (${filesByType[tab.file_type].length})`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-6">
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
          </div>

          <div className="col-2" data-push-left="off-2">
            <button className={clsx('refresh', isFetchingUploads && 'disabled')} onClick={refreshHandler}>
              <RefreshIcon />
              <span>{content?.ui.refresh}</span>
            </button>
          </div>

          <div className="col-2">
            <Sortable
              items={filteredFiles}
              staticLabel={content?.ui.sortby.label}
              options={content?.ui.sortby.options}
              value={defaultQueryOrder}
              queryParam="order"
              onChange={setSortedFiles}
              onSelectChange={showCheckOverlayHandler}
            />
          </div>

          <div className="col-6">
            <div className="files-manager-title has-upload-button">
              <div className="title">{content?.heading}</div>
              <Button
                onClick={onFileUpload}
                variant={content?.upload.theme}
                tracking={{
                  ui: countly.ui[content?.upload.ui],
                  action: content?.upload.action,
                  data: { isFirstFile: false },
                }}
              >
                {content?.upload.text}
              </Button>
            </div>
          </div>
        </div>
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
              storageProviders={item.deals
                .filter(deal => !!deal.storageProvider)
                .map((deal, indx, deals) => (
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
          <button
            className={clsx('delete', !selectedFiles.length && 'disabled')}
            onClick={() => deleteModalState[1](true)}
          >
            {content?.ui.delete.text}
          </button>
          <Pagination
            className="files-manager-pagination"
            items={sortedFiles}
            itemsPerPage={itemsPerPage || 10}
            visiblePages={1}
            queryParam="page"
            onChange={setPaginatedFiles}
            scrollTarget={'.account-files-manager'}
          />
          <Dropdown
            className="files-manager-result-dropdown"
            value={content?.ui.results.options[0].value}
            options={content?.ui.results.options}
            queryParam="items"
            onChange={value => setItemsPerPage(value)}
            onSelectChange={showCheckOverlayHandler}
          />
        </div>
      )}
      <Modal
        className="delete-modal"
        animation="ken"
        modalState={deleteModalState}
        closeIcon={<CloseIcon className="file-uploader-close" />}
        showCloseButton
      >
        <GradientBackground variant="saturated-variant" />
        <div className="delete-modal-content">
          <h5>{content?.ui.delete.heading}</h5>
          <p>{content?.ui.delete.alert}</p>
        </div>
        <div className="delete-modal-buttons">
          <Button variant={ButtonVariant.OUTLINE_DARK} onClick={onDeleteSelected}>
            {content?.ui.delete.ok}
          </Button>
          <Button variant={ButtonVariant.OUTLINE_DARK} onClick={closeDeleteModal}>
            {content?.ui.delete.cancel}
          </Button>
        </div>
      </Modal>
      <div className={clsx('files-manager-overlay', showCheckOverlay ? 'show' : '')}>
        <div className="files-manager-overlay-check">
          <CheckIcon></CheckIcon>
        </div>
      </div>
    </div>
  );
};

export default FilesManager;
