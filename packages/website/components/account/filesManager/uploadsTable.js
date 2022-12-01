import clsx from 'clsx';
import filesize from 'filesize';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

import CloseIcon from 'assets/icons/close';
import RefreshIcon from 'assets/icons/refresh';
import analytics, { saEvent } from 'lib/analytics';
import { formatTimestamp, formatTimestampFull } from 'lib/utils';
import Modal from 'modules/zero/components/modal/modal';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Tooltip from 'ZeroComponents/tooltip/tooltip';
import { useUploads } from 'components/contexts/uploadsContext';
import { useUser } from 'components/contexts/userContext';
import Button, { ButtonVariant } from 'components/button/button';
import Table from 'components/table/table';
import GradientBackground from 'components/gradientbackground/gradientbackground.js';
import CidCellRenderer from 'components/account/filesManager/cellRendererComponents/cidCell';
import EditUploadNameRenderer from 'components/account/filesManager/cellRendererComponents/editUploadNameCell';
import UploadStatusTableRenderer from 'components/account/filesManager/cellRendererComponents/uploadStatusCell';
import StorageProvidersCellRenderer from 'components/account/filesManager/cellRendererComponents/storageProvidersCell';
// import { renameUpload } from 'lib/api';

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
  const { uploads, renameUpload, pages, count, fetchDate, getUploads, isFetchingUploads, deleteUpload } = useUploads();

  const totalUploads = count;
  const { query, replace } = useRouter();
  const {
    storageData: { refetch },
    info,
  } = useUser();

  // Strings
  const fileRowLabels = content?.table.file_row_labels;
  const statusMessages = fileRowLabels.status.tooltip;

  // Constants
  const defaultLinkPrefix = 'w3s.link/ipfs/';
  const defaultSortBy = 'Date';
  const defaultSortOrder = 'Desc';
  const defaultQueryOrder = `${defaultSortBy},${defaultSortOrder}`;
  const defaultSize = ROWS_PER_PAGE_OPTIONS[0];
  const pageQueryParam = 'uploads-page';
  const sizeQueryParam = 'uploads-size';

  let pageParamValue = query[pageQueryParam];
  // If multiple values use the first.
  pageParamValue = Array.isArray(pageParamValue) ? pageParamValue[1] : pageParamValue;

  let sizeParamValue = query[sizeQueryParam];
  // If multiple values use the first.
  sizeParamValue = Array.isArray(sizeParamValue) ? sizeParamValue[1] : sizeParamValue;

  // Query calculated defaults
  const defaultPage = pageParamValue === undefined ? 1 : parseInt(pageParamValue);
  const parsedSizeParam = sizeParamValue === undefined ? 1 : parseInt(sizeParamValue);

  const defaultOrder = Array.isArray(query.order) || query.order === undefined ? defaultQueryOrder : query.order;

  const [page, setPage] = useState(defaultPage || 1);
  const [size, setSize] = useState(parsedSizeParam || defaultSize);
  const [order, setOrder] = useState(defaultOrder);
  const [linkPrefix, setLinkPrefix] = useState(defaultLinkPrefix);
  const [deleteSingleCid, setDeleteSingleCid] = useState('');
  const deleteModalState = useState(false);
  const [selectedUploads, setSelectedUploads] = useState(/** @type {Upload[]} */ ([]));
  const queryOrderRef = useRef(query.order);

  // Re-fetch uploads when props change
  useEffect(() => {
    const [sortBy, sortOrder] = order.split(',');
    getUploads({ size, page, sortBy, sortOrder });
    setSelectedUploads([]);
  }, [getUploads, size, page, order]);

  /** Method to reset the pagination every time query "order" changes. */
  useEffect(() => {
    const orderParamHasChanged =
      (!queryOrderRef.current && !!query.order && query.order !== defaultQueryOrder) ||
      (!!queryOrderRef.current && !!query.order && query.order !== queryOrderRef.current);

    if (orderParamHasChanged) {
      delete query[pageQueryParam];

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
  }, [query.order, query, replace, defaultQueryOrder]);

  /** Selects all uploads on the page. */
  const onSelectAllToggle = useCallback(() => {
    const uploadsToSelect = uploads.filter(u => !selectedUploads.some(selected => selected === u));

    if (!uploadsToSelect.length) {
      setSelectedUploads([]);
      return;
    }

    setSelectedUploads(selectedUploads.concat(uploadsToSelect));
  }, [selectedUploads, setSelectedUploads, uploads]);

  /** Selects a single upload. */
  const onUploadSelect = useCallback(
    value => {
      // Get the exact upload from the list of uploads.
      /** @type {Upload} */
      const upload = uploads.filter(upload => {
        return upload.cid === value.cid;
      })[0];

      const selectedIndex = selectedUploads.findIndex(fileSelected => fileSelected === upload);

      // Remove the upload from the selected list if it has already been selected.
      if (selectedIndex !== -1) {
        selectedUploads.splice(selectedIndex, 1);
        return setSelectedUploads([...selectedUploads]);
      }

      setSelectedUploads([...selectedUploads, upload]);
    },
    [selectedUploads, setSelectedUploads, uploads]
  );

  /** Closes the delete dialog modal. */
  const closeDeleteModal = useCallback(() => {
    deleteModalState[1](false);
    saEvent(analytics.events.FILE_DELETE_CLICK, {
      ui: analytics.ui.FILES,
      totalDeleted: 0,
    });
  }, [deleteModalState]);

  /** Deletes all selected uploads. */
  const onDeleteSelected = useCallback(async () => {
    onUpdatingChange(true);

    try {
      if (deleteSingleCid !== '') {
        await deleteUpload(deleteSingleCid);
      } else {
        await Promise.all(selectedUploads.map(({ cid }) => deleteUpload(cid)));
      }
    } catch (e) {}

    saEvent(analytics.events.FILE_DELETE_CLICK, {
      ui: analytics.ui.FILES,
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

  /** Deletes a single uploads. */
  const onDeleteSingle = useCallback(
    async (/** @type {Upload} */ upload) => {
      deleteModalState[1](true);
      setDeleteSingleCid(upload.cid);
    },
    [deleteModalState]
  );

  /** Handles re-fetching upload date. */
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

  /**
   * @type {import('react').FC}
   * @param {Object} props
   * @returns
   */
  function SizeRenderer({ size }) {
    return <span>{size}</span>;
  }

  /**
   * @type {import('react').FC}
   * @param {Object} props
   * @returns
   */
  function DateRenderer({ date }) {
    return <span title={formatTimestampFull(date)}>{formatTimestamp(date)}</span>;
  }

  /**
   * @type {import('components/table/table').ColumnDefinition[]}
   */
  const columns = [
    {
      id: 'name',
      headerContent: fileRowLabels.name.label,
      cellRenderer: EditUploadNameRenderer,
      getCellProps: cellData => ({
        name: cellData,
        cid: uploads.find(upload => upload.name === cellData)?.cid,
        onNameEdit: showCheckOverlay,
        renameUploadAction: renameUpload,
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
        gatewayPrefix: linkPrefix,
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
      cellRenderer: UploadStatusTableRenderer,
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
      cellRenderer: StorageProvidersCellRenderer,
      getCellProps: cellData => ({
        deals: cellData,
        tooltipText: fileRowLabels.storage_providers.tooltip.queuing,
      }),
    },
    {
      id: 'size',
      headerContent: fileRowLabels.size.label,
      cellRenderer: SizeRenderer,
      getCellProps: cellData => ({
        size: cellData,
      }),
    },
    {
      id: 'date',
      headerContent: fileRowLabels.date.label,
      cellRenderer: DateRenderer,
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
    setPage(page);
  };

  const setSizeHandler = sizeToSet => {
    if (sizeToSet !== size) {
      // Remove the page param.
      delete query[pageQueryParam];

      replace(
        {
          query,
        },
        undefined,
        { shallow: true }
      );

      // Reset to the first page.
      setPage(1);
    }

    setSize(sizeToSet);
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
              ui: analytics.ui[content?.upload.ui],
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
          queryParam="uploads-gateway"
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
        pageQueryParam={pageQueryParam}
        sizeQueryParam={sizeQueryParam}
        isLoading={isFetchingUploads || !fetchDate}
        onPageSelect={onPageSelect}
        onSetItemsPerPage={setSizeHandler}
        selectedRows={selectedUploads.map(upload => uploads.indexOf(upload))}
        onRowSelectedChange={onUploadSelect}
        onSelectAll={onSelectAllToggle}
        onDelete={onDeleteSingle}
        emptyState={
          <span className="files-manager-upload-cta">
            {content?.table.message}
            {'\u00A0'}
            <Button
              onClick={onFileUpload}
              variant={content?.table.cta.theme}
              tracking={{
                ui: analytics.ui[content?.table.cta.ui],
                action: content?.table.cta.action,
                data: { isFirstFile: true },
              }}
              disabled={info?.tags?.['HasAccountRestriction']}
              tooltip={info?.tags?.['HasAccountRestriction'] ? content?.table.cta.accountRestrictedText : ''}
            >
              {content?.table.cta.text}
            </Button>
          </span>
        }
        leftFooterSlot={
          <button
            className={clsx('delete-button', !selectedUploads.length && 'disabled')}
            onClick={() => deleteModalState[1](true)}
          >
            {content?.ui.delete.text}
          </button>
        }
        scrollTarget={'.account-files-manager'}
      />
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
