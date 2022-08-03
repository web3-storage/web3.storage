import clsx from 'clsx';
import filesize from 'filesize';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import countly from 'lib/countly';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Filterable from 'ZeroComponents/filterable/filterable';
import Sortable from 'ZeroComponents/sortable/sortable';
import Pagination from 'ZeroComponents/pagination/pagination';
import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';
import { useUploads } from 'components/contexts/uploadsContext';
import { useUser } from 'components/contexts/userContext';
import { useTokens } from 'components/contexts/tokensContext';
import CheckIcon from 'assets/icons/check';
import SearchIcon from 'assets/icons/search';
import RefreshIcon from 'assets/icons/refresh';
import FileRowItem, { PinStatus } from './fileRowItem';
import GradientBackground from '../../gradientbackground/gradientbackground.js';
import Table from 'components/table/table';

const defaultQueryOrder = 'newest';

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
    totalUploads,
    pinned,
    fetchDate,
    fetchPinsDate,
    getUploads,
    listPinned,
    isFetchingUploads,
    isFetchingPinned,
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
  const { tokens, getTokens } = useTokens();

  const [currentTab, setCurrentTab] = useState('uploaded');
  const [files, setFiles] = useState(/** @type {any} */ (uploads));
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [sortedFiles, setSortedFiles] = useState(filteredFiles);
  const [paginatedFiles, setPaginatedFiles] = useState(sortedFiles);
  const [keyword, setKeyword] = useState(filter);
  const [deleteSingleCid, setDeleteSingleCid] = useState('');
  const [showCheckOverlay, setShowCheckOverlay] = useState(false);
  const deleteModalState = useState(false);
  const queryOrderRef = useRef(query.order);
  const apiToken = tokens.length ? tokens[0].secret : undefined;

  const [selectedFiles, setSelectedFiles] = useState(/** @type {Upload[]} */ ([]));
  const [isUpdating, setIsUpdating] = useState(false);
  const [nameEditingId, setNameEditingId] = useState();
  const fileRowLabels = content?.table.file_row_labels;

  // Set current tab based on url param on load
  // useEffect(() => {
  //   if (query.hasOwnProperty('table') && currentTab !== query?.table) {
  //     if (typeof query.table === 'string') {
  //       if (query.table === 'pinned' && pinned.length === 0) {
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

  // Initial pinned files fetch on component load
  useEffect(() => {
    if (!fetchPinsDate && !isFetchingPinned && apiToken) {
      listPinned('pinned', apiToken);
    }
  }, [fetchPinsDate, listPinned, isFetchingPinned, apiToken]);
  useEffect(() => {
    getTokens();
  }, [getTokens]);

  // Set displayed files based on tab selection: 'uploaded' or 'pinned'
  useEffect(() => {
    if (currentTab === 'uploaded') {
      setFiles(uploads);
    } else if (currentTab === 'pinned') {
      setFiles(pinned.map(item => item.pin));
    }
  }, [uploads, pinned, currentTab]);

  // Method to reset the pagination every time query order changes
  // useEffect(() => {
  //   if (
  //     (!queryOrderRef.current && !!query.order && query.order !== defaultQueryOrder) ||
  //     (!!queryOrderRef.current && !!query.order && query.order !== queryOrderRef.current)
  //   ) {
  //     delete query.page;

  //     replace(
  //       {
  //         query,
  //       },
  //       undefined,
  //       { shallow: true }
  //     );

  //     const scrollToElement = document.querySelector('.account-files-manager');
  //     scrollToElement?.scrollIntoView(true);

  //     queryOrderRef.current = query.order;
  //   }
  // }, [query.order, query, replace]);

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
        return uploads.length;
      case 'pinned':
        return pinned.length;
      default:
        return '';
    }
  };

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

    try {
      if (deleteSingleCid !== '') {
        await deleteUpload(deleteSingleCid);
      } else {
        await Promise.all(selectedFiles.map(({ cid }) => deleteUpload(cid)));
      }
    } catch (e) {}

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

  const tableEmptyState = () => {
    return (
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
    );
  };

  const tableRow = item => {
    return (
      <FileRowItem
        key={item.cid}
        onSelect={() => onFileSelect(item)}
        date={item.created}
        name={item.name}
        cid={item.cid}
        status={
          Object.values(PinStatus).find(status => item.pins.some(pin => status === pin.status)) || PinStatus.QUEUING
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
        size={item.hasOwnProperty('dagSize') ? filesize(item.dagSize) : item.info?.dag_size ? item.info.dag_size : '-'}
        highlight={{ target: 'name', text: keyword?.toString() || '' }}
        numberOfPins={item.pins.length}
        isSelected={!!selectedFiles.find(fileSelected => fileSelected === item)}
        onDelete={() => onDeleteSingle(item.cid)}
        isEditingName={item.cid === nameEditingId}
        onEditToggle={onEditToggle(item.cid)}
        tabType={currentTab}
      />
    );
  };

  // =================
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);

  const onSelectedPage = async page => {
    await getUploads({
      page,
      size: itemsPerPage,
    });
    setCurrentPage(page);
  };

  const setItemsPerPageHandler = ipp => {
    setItemsPerPage(ipp);
    getUploads({
      page: currentPage,
      size: ipp,
    });
  };

  const cellRenderer = ({ value, click }) => {
    return (
      <button onClick={() => click()} onKeyPress={click}>
        {value}
      </button>
    );
  };

  const columns = [
    {
      id: 'date',
      headerContent: (
        <span>
          {fileRowLabels.date.label} <button onClick={() => alert('header')}> i</button>
        </span>
      ),
      cellRenderer,
      getCellProps: cellData => ({
        value: cellData,
        click: () => alert('hi'),
      }),
    },
    {
      id: 'name',
      headerContent: fileRowLabels.name.label,
    },
    {
      id: 'cid',
      headerContent: fileRowLabels.cid.label,
    },
    {
      id: 'status',
      headerContent: fileRowLabels.status.label,
    },
    {
      id: 'storageProviders',
      headerContent: currentTab === 'uploaded' ? fileRowLabels.storage_providers.label : null,
    },
    {
      id: 'size',
      headerContent: fileRowLabels.size.label,
    },
  ];

  /**
   *
   * @param {import('web3.storage').Upload[]} file
   */
  const fileToTableRow = file => {
    return {
      key: file.cid,
      date: file.created,
      name: file.name,
      cid: file.cid,
      status:
        Object.values(PinStatus).find(status => file.pins.some(pin => status === pin.status)) || PinStatus.QUEUING,
      storageProviders: Array.isArray(file.deals)
        ? file.deals
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
        : null,
      size: file.hasOwnProperty('dagSize') ? filesize(file.dagSize) : file.info?.dag_size ? file.info.dag_size : '-',
    };
  };

  return (
    <>
      <div
        style={{ display: 'none' }}
        className={clsx('section files-manager-container', className, isUpdating && 'disabled')}
      >
        {pinned.length > 0 && (
          <div className="upload-pinned-selector">
            {content?.tabs.map(tab => (
              <div key={tab.file_type} className="filetype-tab">
                <button
                  disabled={tab.file_type === 'pinned' && pinned.length === 0}
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
        <div className="files-manager-header">
          <div className="files-manager-title has-upload-button">
            <div className="title">Files</div>
            <Button
              disabled={info?.tags?.['HasAccountRestriction']}
              onClick={onFileUpload}
              variant={content?.upload.theme}
              tracking={{
                ui: countly.ui[content?.upload.ui],
                action: content?.upload.action,
                data: { isFirstFile: false },
              }}
              tooltip={info?.tags?.['HasAccountRestriction'] ? content?.upload.accountRestrictedText : ''}
            >
              {content?.upload.text}
            </Button>
          </div>
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
          <button className={clsx('refresh', isFetchingUploads && 'disabled')} onClick={refreshHandler}>
            <RefreshIcon />
            <span>{content?.ui.refresh}</span>
          </button>
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
            paginatedFiles.every(file => selectedFiles.find(fileSelected => file === fileSelected)) &&
            !!fetchDate
          }
          tabType={currentTab}
        />
        {/* <div className="files-manager-table-content">
        {tableContentLoading(currentTab) ? (
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
              disabled={info?.tags?.['HasAccountRestriction']}
              tooltip={info?.tags?.['HasAccountRestriction'] ? content?.table.cta.accountRestrictedText : ''}
            >
              {content?.table.cta.text}
            </Button>
          </span>
        ) : (
          paginatedFiles.map(item => (
            <FileRowItem
              key={item.cid}
              onSelect={() => onFileSelect(item)}
              date={item.created}
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
      )} */}

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
      <div className="section files-manager-container account-files-manager">
        <Table
          columns={columns}
          rows={files.map(file => fileToTableRow(file))}
          totalRowCount={totalUploads}
          page={currentPage}
          itemsPerPage={itemsPerPage}
          itemsPerPageOptions={[2, 20, 50, 100, 500]}
          isEmpty={totalUploads === 0}
          withRowSelection={true}
          isLoading={isFetchingUploads || !fetchDate}
          onPageSelect={onSelectedPage}
          emptyState={tableEmptyState()}
          onRowSelect={rows => console.log(rows)}
          deleteRowBtn={
            <button
              className={clsx('delete', !selectedFiles.length && 'disabled')}
              onClick={() => deleteModalState[1](true)}
            >
              {content?.ui.delete.text}
            </button>
          }
          onSetItemsPerPage={ipp => {
            setItemsPerPageHandler(ipp);
          }}
          scrollTarget={'.account-files-manager'}
        />
      </div>
    </>
  );
};

export default FilesManager;
