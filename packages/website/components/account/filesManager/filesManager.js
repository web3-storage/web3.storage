import clsx from 'clsx';
import filesize from 'filesize';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

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
import { useTokens } from 'components/contexts/tokensContext';
import CheckIcon from 'assets/icons/check';
import FileRowItem, { PinStatus } from './fileRowItem';

const defaultQueryOrder = 'newest';

const tableTypes = {
  UPLOADED: 'uploaded',
  PINNED: 'pinned',
}

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

  const {
    uploads,
    pinned,
    fetchDate,
    fetchPinsDate,
    getUploads,
    listPinned,
    isFetchingUploads,
    isFetchingPinned,
    totalNumberOfUploads,
    deleteUpload,
    renameUpload,
  } = useUploads();
  const {
    query: { filter },
    query,
    replace,
  } = useRouter();
  const {
    storageData: { refetch },
    info,
  } = useUser();
  const { tokens } = useTokens();
  const [currentTab, setCurrentTab] = useState('uploaded');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [keyword, setKeyword] = useState(filter);
  const [deleteSingleCid, setDeleteSingleCid] = useState('');
  const [showCheckOverlay, setShowCheckOverlay] = useState(false);
  const deleteModalState = useState(false);

  const queryOrderRef = useRef(query.order);
  const queryItemsRef = useRef(query.items);
  const queryTableRef = useRef(query.table);

  const apiToken = tokens.length ? tokens[0].secret : true;

  const [selectedFiles, setSelectedFiles] = useState(/** @type {Upload[]} */ ([]));
  const [isUpdating, setIsUpdating] = useState(false);
  const [nameEditingId, setNameEditingId] = useState();
  const fileRowLabels = content?.table.file_row_labels;
  const title = content?.tabs.find(item => item.file_type === currentTab);

  const fetchData = useCallback(
    async args => {
      console.log('fetchin', currentTab)
      if (args.page) {
        args.offset = args.size * (args.page - 1);
      }
      if (currentTab === tableTypes.UPLOADED) {
        getUploads(args);
      }
    },
    [getUploads]
  );

  // Set current tab based on url param on load
  // useEffect(() => {
  //   if (query.hasOwnProperty('table') && currentTab !== query?.table) {
  //     if (typeof query.table === 'string') {
  //       if (query.table === 'pinned' && pinned?.length === 0) {
  //         delete query.table;
  //         replace(
  //           {
  //             query,
  //           },
  //           undefined,
  //           { shallow: true }
  //         );
  //         return;
  //       }
  //       setCurrentTab(query.table);
  //     }
  //   }
  // }, [query, currentTab, pinned, replace]);

  // // Initial uploads fetch on component load
  // useEffect(() => {
  //   if (!fetchDate && !isFetchingUploads) {
  //     getUploads();
  //   }
  // }, [fetchDate, getUploads, isFetchingUploads]);

  // Initial pinned files fetch on component load
  // useEffect(() => {
  //   console.log('list pinned', apiToken)
  //   if (!fetchPinsDate && !isFetchingPinned && apiToken) {
  //     console.log('LP', apiToken)
  //     listPinned('pinned', apiToken);

  //   }
  // }, [fetchPinsDate, listPinned, isFetchingPinned, apiToken]);

  // Set displayed files based on tab selection: 'uploaded' or 'pinned'
  // useEffect(() => {
  //   console.log('tab change', currentTab)
  //   if (currentTab === 'uploaded') {
  //     // setFiles(uploads);
  //   } else if (currentTab === 'pinned') {
  //     // setFiles(pinned?.map(item => item.pin));
  //   }
  // }, [uploads, pinned, currentTab]);

  useEffect(() => {
    console.log('query change', Object.values(tableTypes), currentTab)
    if (query.table && typeof query.table === 'string' && Object.values(tableTypes).includes(query.table)) {
      console.log('setting tab', query.table)
      setCurrentTab(query.table);
      console.log('query', query.table, currentTab)
    }
    // Method to reset the pagination every time query order or size changes
    if ((query.items !== queryItemsRef.current || query.order !== queryOrderRef.current) && query.page) {
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

      queryItemsRef.current = query.items;
      queryOrderRef.current = query.order;
      return;
    }
    if (query.items && typeof query.items === 'string') {
      setItemsPerPage(parseInt(query.items || '10'));
    }

    let sortingQuery = {};
    if (query.order) {
      switch (query.order) {
        case 'a-z':
          sortingQuery = { sortBy: 'name', sortOrder: 'desc' };
          break;

        case 'z-a':
          sortingQuery = { sortBy: 'name', sortOrder: 'asc' };
          break;

        case 'newest':
          sortingQuery = { sortBy: 'data', sortOrder: 'desc' };
          break;

        case 'oldest':
          sortingQuery = { sortBy: 'date', sortOrder: 'asc' };
          break;

        default:
          break;
      }
    }
    fetchData({
      ...sortingQuery,
      size: query.items || 10,
      page: query.page || null,
    });
  }, [query.order, query.page, query.items, query, replace, fetchData]);

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
        return totalNumberOfUploads || uploads.length;
      case 'pinned':
        return pinned?.length;
      default:
        return '';
    }
  };

  const onSelectAllToggle = useCallback(
    e => {
      const filesToSelect = uploads.filter(file => !selectedFiles.some(fileSelected => fileSelected === file));

      if (!filesToSelect.length) {
        return setSelectedFiles([]);
      }

      return setSelectedFiles(selectedFiles.concat(filesToSelect));
    },
    [uploads, selectedFiles, setSelectedFiles]
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

      const fileTarget = uploads.find(({ cid }) => cid === targetCID);
      if (!!fileTarget && !!newFileName && newFileName !== fileTarget.name) {
        setIsUpdating(true);
        await renameUpload(targetCID, newFileName);
        fileTarget.name = newFileName;
        setIsUpdating(false);
      }
    },
    [renameUpload, uploads, nameEditingId]
  );

  const showCheckOverlayHandler = useCallback(() => {
    setShowCheckOverlay(true);
    setTimeout(() => {
      setShowCheckOverlay(false);
    }, 500);
  }, [setShowCheckOverlay]);

  const refreshHandler = useCallback(() => {
    if (currentTab === 'uploaded') {
      getUploads();
    } else if (currentTab === 'pinned' && apiToken) {
      listPinned('pinned', apiToken);
    }
    showCheckOverlayHandler();
  }, [currentTab, getUploads, listPinned, showCheckOverlayHandler, apiToken]);

  const tableContentLoading = tab => {
    switch (tab) {
      case 'uploaded':
        return isFetchingUploads || !fetchDate;
      case 'pinned':
        return isFetchingPinned || !fetchPinsDate;
      default:
        return true;
    }
  };

  return (
    <div className={clsx('section files-manager-container', className, isUpdating && 'disabled')}>
      <div className="files-manager-header">
        <div className="grid-noGutter header-grid-wrapper">
          <div className="col-12">
            <div className="upload-pinned-selector">
              {content?.tabs.map(tab => (
                <div key={tab.file_type} className="filetype-tab">
                  <button
                    // disabled={tab.file_type === 'pinned' && pinned?.length === 0}
                    className={clsx('tab-button', currentTab === tab.file_type ? 'selected' : '')}
                    onClick={() => changeCurrentTab(tab.file_type)}
                  >
                    <span>{tab.button_text}</span>
                    <span>{` (${getFilesTotal(tab.file_type)})`}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-6_sm-12">
            {/* <Filterable
              className="files-manager-search"
              items={files}
              icon={<SearchIcon />}
              filterKeys={['name', 'cid']}
              placeholder={content?.ui.filter_placeholder}
              queryParam="filter"
              onValueChange={setKeyword}
            /> */}
          </div>

          <div className="col-4_sm-6_mi-12" data-push-left="off-2_sm-0">
            <div className="files-manager-controls">
              <button className={clsx('refresh', isFetchingUploads && 'disabled')} onClick={refreshHandler}>
                <RefreshIcon />
                <span>{content?.ui.refresh}</span>
              </button>

              <Sortable
                items={uploads}
                staticLabel={content?.ui.sortby.label}
                options={content?.ui.sortby.options}
                value={defaultQueryOrder}
                queryParam="order"
                onSelectChange={showCheckOverlayHandler}
              />
            </div>
          </div>

          <div className="col-6_sm-12">
            <div className="files-manager-title has-upload-button">
              <h2 className="files-manager-heading">
                {keyword
                  ? title.searchHeading
                      .replace('%resultsNumber%', uploads.length)
                      .replace('%searchQuery%', `'${keyword}'`)
                  : title.heading}
              </h2>
              {title.file_type === 'uploaded' ? (
                <Button
                  onClick={onFileUpload}
                  disabled={info?.tags['HasAccountRestriction']}
                  variant={content?.upload.theme}
                  tooltip={info?.tags['HasAccountRestriction'] ? content.upload.accountRestrictedText : ''}
                  tracking={{
                    ui: countly.ui[content?.upload.ui],
                    action: content?.upload.action,
                    data: { isFirstFile: false },
                  }}
                >
                  {content?.upload.text}
                </Button>
              ) : (
                ''
              )}
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
        storageProviders={currentTab === 'uploaded' ? fileRowLabels.storage_providers.label : null}
        size={fileRowLabels.size.label}
        isHeader
        isSelected={
          !!selectedFiles.length &&
          uploads.every(file => selectedFiles.find(fileSelected => file === fileSelected)) &&
          !!fetchDate
        }
        tabType={currentTab}
      />
      <div className="files-manager-table-content">
        {tableContentLoading(currentTab) ? (
          <Loading className={'files-loading-spinner'} />
        ) : !uploads.length ? (
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
              disabled={info?.tags?.['HasAccountRestriction']}
              tooltip={info?.tags?.['HasAccountRestriction'] ? content?.table.cta.accountRestrictedText : ''}
            >
              {content?.table.cta.text}
            </Button>
          </span>
        ) : (
          uploads?.map(item => (
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
              storageProviders={
                Array.isArray(item.deals)
                  ? item.deals
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
                      ))
                  : null
              }
              size={
                item.hasOwnProperty('dagSize') ? filesize(item.dagSize) : item.info?.dag_size ? item.info.dag_size : '-'
              }
              highlight={{ target: 'name', text: keyword?.toString() || '' }}
              numberOfPins={item.pins.length}
              isSelected={!!selectedFiles.find(fileSelected => fileSelected === item)}
              onDelete={() => onDeleteSingle(item.cid)}
              isEditingName={item.cid === nameEditingId}
              onEditToggle={onEditToggle(item.cid)}
              tabType={currentTab}
            />
          ))
        )}
      </div>
      {!!uploads.length && (
        <div className="files-manager-footer">
          <button
            className={clsx('delete', !selectedFiles.length && 'disabled')}
            onClick={() => deleteModalState[1](true)}
          >
            {content?.ui.delete.text}
          </button>
          <Pagination
            className="files-manager-pagination"
            items={uploads}
            totalItemCount={totalNumberOfUploads || uploads.length}
            itemsPerPage={itemsPerPage}
            visiblePages={1}
            queryParam="page"
            scrollTarget={'.account-files-manager'}
          />
          <Dropdown
            className="files-manager-result-dropdown"
            value={content?.ui.results.options[0].value}
            options={content?.ui.results.options}
            queryParam="items"
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
