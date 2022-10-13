import clsx from 'clsx';
import filesize from 'filesize';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import CloseIcon from 'assets/icons/close';
import RefreshIcon from 'assets/icons/refresh';
import countly from 'lib/countly';
import { formatTimestamp, formatTimestampFull } from 'lib/utils';
import Modal from 'modules/zero/components/modal/modal';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import { ServerPagination } from 'ZeroComponents/pagination/pagination';
import Tooltip from 'ZeroComponents/tooltip/tooltip';
import { useUploads } from 'components/contexts/uploadsContext';
import { useUser } from 'components/contexts/userContext';
import Button, { ButtonVariant } from 'components/button/button';
import Table from 'components/table/table';
import GradientBackground from 'components/gradientbackground/gradientbackground.js';
import CidCellRenderer from 'components/account/filesManager/cellRendererComponents/cidCell';
import editUploadNameRenderer from 'components/account/filesManager/cellRendererComponents/editUploadNameCell';
import uploadStatusTableRenderer from 'components/account/filesManager/cellRendererComponents/uploadStatusCell';
import storageProvidersCellRenderer from 'components/account/filesManager/cellRendererComponents/storageProvidersCell';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

/**
 * @typedef {import('web3.storage').Upload} Upload
 * @typedef {import('../../contexts/uploadsContext').PinObject} PinObject
 */

/**
 * @typedef {Object} UploadsTableProps
 * @prop {any} [content]
 * @prop {boolean} hidden
 * @prop {() => void} onFileUpload
 * @prop {(isUpdating: boolean) => void} onUpdatingChange
 * @prop {() => void} showCheckOverlay
 */

/**
 * @param {UploadsTableProps} props
 */
const UploadsTable = ({ content, hidden, onFileUpload, onUpdatingChange, showCheckOverlay }) => {
  const { uploads, pages, count, fetchDate, getUploads, isFetchingUploads, deleteUpload } = useUploads();

  const totalUploads = count;

  const {
    // query: { filter },
    query,
    // replace,
  } = useRouter();

  const {
    storageData: { refetch },
    info,
  } = useUser();

  // console.log(query.size)
  // console.log(query.page)
  // console.log(query.sortBy)
  // console.log(query.sortOrder)
  // console.log(query.order);

  // const [sortBy, setSortBy] = useState(defaultSortBy);
  // const [sortOrder, setSortOrder] = useState(query.sortOrder || defaultSortOrder);
  const defaultLinkPrefix = 'w3s.link/ipfs/';

  const defaultPage = Array.isArray(query.page) || query.page === undefined ? 1 : parseInt(query.page);

  const defaultSize =
    Array.isArray(query.size) || query.size === undefined ? ROWS_PER_PAGE_OPTIONS[0] : parseInt(query.size);

  const defaultSortBy = 'Date';
  const defaultSortOrder = 'Desc';
  const defaultQueryOrder = `${defaultSortBy},${defaultSortOrder}`;
  const defaultOrder = Array.isArray(query.order) || query.order === undefined ? defaultQueryOrder : query.order;

  const [page, setPage] = useState(defaultPage || 1);
  const [size, setSize] = useState(defaultSize || ROWS_PER_PAGE_OPTIONS[0]);
  const [order, setOrder] = useState(defaultOrder);
  const [linkPrefix, setLinkPrefix] = useState(defaultLinkPrefix);
  const [deleteSingleCid, setDeleteSingleCid] = useState('');
  const deleteModalState = useState(false);
  const [selectedUploads, setSelectedUploads] = useState(/** @type {Upload[]} */ ([]));
  // const [keyword] = useState(filter);
  // const [nameEditingId, setNameEditingId] = useState();

  const fileRowLabels = content?.table.file_row_labels;

  // Re-fetch uploads when props change
  useEffect(() => {
    const [sortBy, sortOrder] = order.split(',');
    getUploads({ size, page, sortBy, sortOrder });
    setSelectedUploads([]);
  }, [getUploads, size, page, order]);

  // // Method to reset the pagination every time query order changes
  // useEffect(() => {
  //   if (
  //     (!queryOrderRef.current && !!query.order && query.order !== defaultQueryOrder) ||
  //     (!!queryOrderRef.current && !!query.order && query.order !== queryOrderRef.current)
  //   ) {
  //     delete query.page;
  //     console.log('changin ')
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

  // Selects all uploads on the page.
  const onSelectAllToggle = useCallback(
    e => {
      const uploadsToSelect = uploads.filter(u => !selectedUploads.some(selected => selected === u));

      if (!uploadsToSelect.length) {
        return setSelectedUploads([]);
      }

      return setSelectedUploads(selectedUploads.concat(uploadsToSelect));
    },
    [selectedUploads, setSelectedUploads, uploads]
  );

  // Select a single upload.
  const onUploadSelect = useCallback(
    value => {
      const upload = uploads.filter(upload => {
        return upload.cid === value.cid;
      })[0];

      const selectedIndex = selectedUploads.findIndex(fileSelected => fileSelected === upload);

      // Remove the selected index
      if (selectedIndex !== -1) {
        selectedUploads.splice(selectedIndex, 1);
        return setSelectedUploads([...selectedUploads]);
      }

      setSelectedUploads([...selectedUploads, upload]);
    },
    [selectedUploads, setSelectedUploads, uploads]
  );

  const closeDeleteModal = useCallback(() => {
    deleteModalState[1](false);
    countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
      ui: countly.ui.FILES,
      totalDeleted: 0,
    });
  }, [deleteModalState]);

  // Deletes all selected uploads
  const onDeleteSelected = useCallback(async () => {
    onUpdatingChange(true);

    try {
      if (deleteSingleCid !== '') {
        await deleteUpload(deleteSingleCid);
      } else {
        await Promise.all(selectedUploads.map(({ cid }) => deleteUpload(cid)));
      }
    } catch (e) {}

    countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
      ui: countly.ui.FILES,
      totalDeleted: selectedUploads.length,
    });

    onUpdatingChange(false);
    setSelectedUploads([]);
    const [sortBy, sortOrder] = order.split(',');
    getUploads({ size, page, sortBy, sortOrder });
    setDeleteSingleCid('');
    deleteModalState[1](false);
    refetch();
  }, [
    onUpdatingChange,
    selectedUploads,
    order,
    getUploads,
    size,
    page,
    deleteModalState,
    refetch,
    deleteSingleCid,
    deleteUpload,
  ]);

  // const onDeleteSingle = useCallback(
  //   async cid => {
  //     deleteModalState[1](true);
  //     setDeleteSingleCid(cid);
  //   },
  //   [deleteModalState]
  // );

  // const onEditToggle = useCallback(
  //   targetCID => async (/** @type {string|undefined} */ newFileName) => {
  //     console.log('OET')
  //     setNameEditingId(targetCID !== nameEditingId ? targetCID : undefined);

  //     const fileTarget = uploads.find(({ cid }) => cid === targetCID);
  //     if (!!fileTarget && !!newFileName && newFileName !== fileTarget.name) {
  //       onUpdatingChange(true);
  //       await renameUpload(targetCID, newFileName);
  //       fileTarget.name = newFileName;
  //       onUpdatingChange(false);
  //     }
  //   },
  //   [nameEditingId, uploads, onUpdatingChange, renameUpload]
  // );

  const refreshHandler = useCallback(() => {
    const [sortBy, sortOrder] = order.split(',');
    getUploads({ size, page, sortBy, sortOrder });
    showCheckOverlay();
  }, [getUploads, size, page, order, showCheckOverlay]);

  const onSortChange = useCallback(
    value => {
      if (order === value) return;
      setOrder(value);
      showCheckOverlay();
    },
    [showCheckOverlay, order]
  );

  // Do not render anything if this component is hidden.
  if (hidden) {
    return null;
  }

  // NEW TABLE DATA
  // TODO: move to its own component

  const statusMessages = fileRowLabels.status.tooltip;

  /**
   * @type {import('components/table/table').ColumnDefinition[]}
   */
  const columns = [
    {
      id: 'name',
      headerContent: fileRowLabels.name.label,
      cellRenderer: editUploadNameRenderer,
      getCellProps: cellData => ({
        name: cellData,
      }),
    },
    {
      id: 'cid',
      headerContent: (
        <span>
          {fileRowLabels.cid.label}
          <Tooltip content={fileRowLabels.cid.tooltip} />
        </span>
      ),
      cellRenderer: CidCellRenderer,
      getCellProps: cellData => ({
        cid: cellData,
      }),
    },
    {
      id: 'status',
      headerContent: (
        <span>
          {fileRowLabels.status.label}
          <Tooltip content={statusMessages.header} />
        </span>
      ),
      cellRenderer: uploadStatusTableRenderer,
      getCellProps: cellData => ({
        pins: cellData,
        statusMessages,
      }),
    },
    {
      id: 'storageProviders',
      headerContent: (
        <span>
          {fileRowLabels.storage_providers.label}
          <Tooltip content={fileRowLabels.storage_providers.tooltip.header} />
        </span>
      ),
      cellRenderer: storageProvidersCellRenderer,
      getCellProps: cellData => ({
        deals: cellData,
        fileRowLabels,
      }),
    },
    {
      id: 'size',
      headerContent: fileRowLabels.size.label,
    },
    {
      id: 'date',
      headerContent: fileRowLabels.date.label,
      cellRenderer: ({ date }) => <span title={formatTimestampFull(date)}>{formatTimestamp(date)}</span>,
      getCellProps: cellData => ({
        date: cellData,
      }),
    },
  ];

  /**
   *
   * @param {any} file
   */
  const fileToTableRow = file => {
    return {
      key: file.cid,
      date: file.created,
      name: file.name,
      cid: file.cid,
      status: file.pins,
      storageProviders: file.deals,
      size: file.hasOwnProperty('dagSize') ? filesize(file.dagSize) : file.info?.dag_size ? file.info.dag_size : '-',
    };
  };

  const onPageSelect = page => {
    console.log(page);
    setPage(page);
  };

  return (
    <>
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
        <button className={clsx('refresh', isFetchingUploads && 'disabled')} onClick={refreshHandler}>
          <RefreshIcon />
          <span>{content?.ui.refresh}</span>
        </button>
        <Dropdown
          className="Sortable"
          staticLabel={content?.ui.sortby.label}
          options={content?.ui.sortby.options}
          value={order}
          queryParam="order"
          onChange={onSortChange}
        />
        <Dropdown
          className="files-manager-gateway"
          staticLabel="Gateway"
          value={linkPrefix}
          options={[
            { value: 'https://w3s.link/ipfs/', label: 'w3link' },
            { value: 'https://dweb.link/ipfs/', label: 'dweb' },
          ]}
          onChange={value => {
            if (value === linkPrefix) return;
            setLinkPrefix(value);
            showCheckOverlay();
          }}
        />
      </div>

      <Table
        columns={columns}
        rows={uploads.map(file => fileToTableRow(file))}
        totalRowCount={totalUploads}
        page={page}
        totalPages={pages}
        rowsPerPage={size}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        isEmpty={totalUploads === 0}
        withRowSelection={true}
        isLoading={isFetchingUploads || !fetchDate}
        onPageSelect={onPageSelect}
        onSetItemsPerPage={setSize}
        emptyState={<span>EMPTY</span>}
        selectedRows={selectedUploads.map(upload => uploads.indexOf(upload))}
        onRowSelectedChange={onUploadSelect}
        onSelectAll={onSelectAllToggle}
        leftFooterSlot={
          <button
            className={clsx('delete', !selectedUploads.length && 'disabled')}
            onClick={() => deleteModalState[1](true)}
          >
            {content?.ui.delete.text}
          </button>
        }
        // onSetItemsPerPage={rpp => {
        //   setRowsPerPage(rpp);
        //   setCurrentPage(1);

        //   // TODO: Do we need this now that the loader spins for the request happening?
        //   setShowCheckOverlay(true);
        //   setTimeout(() => {
        //     setShowCheckOverlay(false);
        //   }, 500);
        // }}
        scrollTarget={'.account-files-manager'}
      />

      {!!uploads.length && (
        <div className="files-manager-footer">
          <button
            className={clsx('delete', !selectedUploads.length && 'disabled')}
            onClick={() => deleteModalState[1](true)}
          >
            {content?.ui.delete.text}
          </button>
          <ServerPagination
            className="files-manager-pagination"
            itemsPerPage={size}
            visiblePages={1}
            pageCount={pages}
            queryParam="page"
            onChange={setPage}
            scrollTarget={'.account-files-manager'}
          />
          <Dropdown
            className="files-manager-result-dropdown"
            value={content?.ui.results.options[0].value}
            options={content?.ui.results.options}
            queryParam="items"
            onChange={value => setSize(value)}
            onSelectChange={showCheckOverlay}
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
    </>
  );
};

export default UploadsTable;
