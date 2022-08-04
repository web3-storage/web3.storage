import filesize from 'filesize';
import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';

import { useUploads } from 'components/contexts/uploadsContext';
import Table from 'components/table/table';
import countly from 'lib/countly';
import { useUser } from 'components/contexts/userContext';
import RefreshIcon from 'assets/icons/refresh';
import Modal from 'modules/zero/components/modal/modal';
import GradientBackground from 'components/gradientbackground/gradientbackground';
import CloseIcon from 'assets/icons/close';
import Button, { ButtonVariant } from 'components/button/button';
import CheckIcon from 'assets/icons/check';
import useQueryParams from 'ZeroHooks/useQueryParams';
// import Filterable from 'ZeroComponents/filterable/filterable';
// import SearchIcon from 'assets/icons/search';

// TODO: figure out a better place to store this.
export const PinStatus = {
  PINNED: 'Pinned',
  PINNING: 'Pinning',
  PIN_QUEUED: 'PinQueued',
  QUEUING: 'Queuing...',
};

const ROWS_PER_PAGE_OPTIONS = [2, 4, 20, 50, 100, 500];

/**
 * @type {import('react').FC}
 *
 *
 * TODO:
 * - Need to figure out reloading when uploading a new file (atm FileUploader is calling getUploads)
 * - Need to fix issue with currentPage being the wrong value when re-setting rowsPerPage
 * - Need to figure out 'isUpdating' state
 * - Consider moving some state/components might need to be lifted
 *   to parent component (Modal, overlay et) to be shared with pins
 * - Fix issue with onSetItemsPerPage being called on load and always resetting page to 1
 */
export default function UploadsContainer({ content, onFileUpload }) {
  const fileRowLabels = content?.table.file_row_labels;

  const {
    uploads,
    totalUploads,
    fetchDate,
    getUploads,
    isFetchingUploads,
    deleteUpload,
    // renameUpload
  } = useUploads();
  const { info } = useUser();

  const [currentPage, setCurrentPage] = useQueryParams('page', 0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [selectedRows, setSelectedRows] = useState(/** @type{string[]}*/ ([]));
  // const [keyword, setKeyword] = useState(/** @type{string[]}*/ []);
  // const [sort, setSort] = useState();
  const [refetchDate, setRefetchDate] = useState(/** @type{number | undefined}*/ (undefined));
  const [deleteModalState, setDeleteModalState] = useState(false);
  const [showCheckOverlay, setShowCheckOverlay] = useState(false);

  // Fetch uploads when query changes.
  // TODO: consider tidying up state with url query
  useEffect(() => {
    setSelectedRows([]);

    // TODO: when updating rowsPerPage, despite previous effect is run in advance,
    // rowsPerPage here contains the old value.
    getUploads({
      size: rowsPerPage,
      page: parseInt(currentPage),
    });
  }, [getUploads, currentPage, rowsPerPage, refetchDate]);

  /**
   * @type {import('components/table/table').ColumnDefinition[]}
   */
  const columns = [
    {
      id: 'date',
      headerContent: (
        <span>
          {fileRowLabels.date.label} <button onClick={() => alert('header')}> i</button>
        </span>
      ),
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
      headerContent: fileRowLabels.storage_providers.label,
    },
    {
      id: 'size',
      headerContent: fileRowLabels.size.label,
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

  const renderTableEmptyState = () => {
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

  const onSelectedPage = useCallback(
    async page => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const onRowSelectedChange = useCallback(
    (key, value) => {
      let newSelected;
      if (value) {
        newSelected = [key, ...selectedRows];
      } else {
        newSelected = selectedRows.filter(i => i !== key);
      }
      setSelectedRows(newSelected);
    },
    [selectedRows]
  );

  const onSelectAll = useCallback(
    value => {
      if (value) {
        setSelectedRows(uploads.map(u => u.cid));
      } else {
        setSelectedRows([]);
      }
    },
    [uploads]
  );

  const closeDeleteModal = useCallback(() => {
    setDeleteModalState(false);
    countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
      ui: countly.ui.FILES,
      totalDeleted: 0,
    });
  }, []);

  const onDeleteSelected = useCallback(async () => {
    await Promise.all(selectedRows.map(cid => deleteUpload(cid)));
    setRefetchDate(Date.now());
  }, [selectedRows, deleteUpload]);

  const refreshHandler = () => {
    setRefetchDate(Date.now());
  };

  return (
    <div
      style={{
        gridArea: 'files-manager',
        minHeight: '21.375rem',
      }}
    >
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
        {/* TODO make search work */}
        {/* <Filterable
          className="files-manager-search"
          items={[]}
          icon={<SearchIcon />}
          filterKeys={['name', 'cid']}
          placeholder={content?.ui.filter_placeholder}
          queryParam="filter"
          onValueChange={setKeyword}
        /> */}
        <button className={clsx('refresh', isFetchingUploads && 'disabled')} onClick={refreshHandler}>
          <RefreshIcon />
          <span>{content?.ui.refresh}</span>
        </button>
        {/* <Sortable
          items={[]}
          staticLabel={content?.ui.sortby.label}
          options={content?.ui.sortby.options}
          value={defaultQueryOrder}
          queryParam="order"
          onChange={setSortedFiles}
          onSelectChange={showCheckOverlayHandler}
        /> */}
      </div>
      <Table
        columns={columns}
        rows={uploads.map(file => fileToTableRow(file))}
        totalRowCount={totalUploads}
        page={parseInt(currentPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        isEmpty={totalUploads === 0}
        withRowSelection={true}
        isLoading={isFetchingUploads || !fetchDate}
        onPageSelect={onSelectedPage}
        emptyState={renderTableEmptyState()}
        selectedRows={selectedRows}
        onRowSelectedChange={onRowSelectedChange}
        onSelectAll={onSelectAll}
        leftFooterSlot={
          <button
            className={clsx('delete', !selectedRows.length && 'disabled')}
            onClick={() => setDeleteModalState(true)}
          >
            {content?.ui.delete.text}
          </button>
        }
        onSetItemsPerPage={rpp => {
          setRowsPerPage(rpp);
          setCurrentPage(1);

          // TODO: Do we need this now that the loader spins for the request happening?
          setShowCheckOverlay(true);
          setTimeout(() => {
            setShowCheckOverlay(false);
          }, 500);
        }}
        scrollTarget={'.account-files-manager'}
      />

      <Modal
        className="delete-modal"
        animation="ken"
        modalState={[deleteModalState, setDeleteModalState]}
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
}
