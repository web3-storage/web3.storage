import clsx from 'clsx';
import filesize from 'filesize';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import countly from 'lib/countly';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
// import Filterable from 'ZeroComponents/filterable/filterable';
import { ServerPagination } from 'ZeroComponents/pagination/pagination';
import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';
import { useUploads } from 'components/contexts/uploadsContext';
import { useUser } from 'components/contexts/userContext';
// import SearchIcon from 'assets/icons/search';
import RefreshIcon from 'assets/icons/refresh';
import FileRowItem from './fileRowItem';
import GradientBackground from '../../gradientbackground/gradientbackground.js';

const defaultSortBy = 'Date';
const defaultSortOrder = 'Desc';
const defaultQueryOrder = `${defaultSortBy},${defaultSortOrder}`;

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
  const { uploads, pages, fetchDate, getUploads, isFetchingUploads, deleteUpload, renameUpload } = useUploads();
  const {
    query: { filter },
    query,
    replace,
  } = useRouter();
  const {
    storageData: { refetch },
    info,
  } = useUser();

  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [linkPrefix, setLinkPrefix] = useState('w3s.link/ipfs/');
  const [keyword] = useState(filter);
  const [deleteSingleCid, setDeleteSingleCid] = useState('');
  const deleteModalState = useState(false);
  const queryOrderRef = useRef(query.order);

  const [selectedUploads, setSelectedUploads] = useState(/** @type {Upload[]} */ ([]));
  const [nameEditingId, setNameEditingId] = useState();
  const fileRowLabels = content?.table.file_row_labels;

  // Re-fetch uploads when props change
  useEffect(() => {
    getUploads({ size, page, sortBy, sortOrder });
    setSelectedUploads([]);
  }, [getUploads, size, page, sortBy, sortOrder]);

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

  const onUploadSelect = useCallback(
    /** @type {Upload} */ file => {
      const selectedIndex = selectedUploads.findIndex(fileSelected => fileSelected === file);
      if (selectedIndex !== -1) {
        selectedUploads.splice(selectedIndex, 1);
        return setSelectedUploads([...selectedUploads]);
      }

      setSelectedUploads([...selectedUploads, file]);
    },
    [selectedUploads, setSelectedUploads]
  );

  const closeDeleteModal = useCallback(() => {
    deleteModalState[1](false);
    countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
      ui: countly.ui.FILES,
      totalDeleted: 0,
    });
  }, [deleteModalState]);

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

    getUploads({ size, page, sortBy, sortOrder });
    setDeleteSingleCid('');
    deleteModalState[1](false);
    refetch();
  }, [
    onUpdatingChange,
    selectedUploads,
    getUploads,
    size,
    page,
    sortBy,
    sortOrder,
    deleteModalState,
    refetch,
    deleteSingleCid,
    deleteUpload,
  ]);

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
        onUpdatingChange(true);
        await renameUpload(targetCID, newFileName);
        fileTarget.name = newFileName;
        onUpdatingChange(false);
      }
    },
    [nameEditingId, uploads, onUpdatingChange, renameUpload]
  );

  const refreshHandler = useCallback(() => {
    getUploads({ size, page, sortBy, sortOrder });
    showCheckOverlay();
  }, [getUploads, size, page, sortBy, sortOrder, showCheckOverlay]);

  const onSortChange = useCallback(
    value => {
      if (`${sortBy},${sortOrder}` === value) return;
      const [newSortBy, newSortOrder] = value.split(',');
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      showCheckOverlay();
    },
    [showCheckOverlay, sortBy, sortOrder]
  );

  if (hidden) {
    return null;
  }

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
        {/* <Filterable
          className="files-manager-search"
          items={files}
          icon={<SearchIcon />}
          filterKeys={['name', 'cid']}
          placeholder={content?.ui.filter_placeholder}
          queryParam="filter"
          onChange={setFilteredFiles}
          onValueChange={setKeyword}
        /> */}
        <button className={clsx('refresh', isFetchingUploads && 'disabled')} onClick={refreshHandler}>
          <RefreshIcon />
          <span>{content?.ui.refresh}</span>
        </button>
        <Dropdown
          className="Sortable"
          staticLabel={content?.ui.sortby.label}
          options={content?.ui.sortby.options}
          value={`${sortBy},${sortOrder}`}
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
      <FileRowItem
        onSelect={onSelectAllToggle}
        date={fileRowLabels.date.label}
        name={fileRowLabels.name.label}
        cid={fileRowLabels.cid.label}
        status={fileRowLabels.status.label}
        storageProviders={fileRowLabels.storage_providers.label}
        size={fileRowLabels.size.label}
        linkPrefix={linkPrefix}
        isHeader
        isSelected={
          !!selectedUploads.length &&
          uploads.every(file => selectedUploads.find(fileSelected => file === fileSelected)) &&
          !!fetchDate
        }
        tabType="uploaded"
      />
      <div className="files-manager-table-content">
        {isFetchingUploads || !fetchDate ? (
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
          uploads.map(item => (
            <FileRowItem
              key={item.cid}
              onSelect={() => onUploadSelect(item)}
              date={item.created}
              name={item.name}
              cid={item.cid}
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
              size={'dagSize' in item ? filesize(item.dagSize) : '-'}
              linkPrefix={linkPrefix}
              highlight={{ target: 'name', text: keyword?.toString() || '' }}
              numberOfPins={item.pins.length}
              isSelected={!!selectedUploads.find(fileSelected => fileSelected === item)}
              onDelete={() => onDeleteSingle(item.cid)}
              isEditingName={item.cid === nameEditingId}
              onEditToggle={onEditToggle(item.cid)}
              tabType="uploaded"
            />
          ))
        )}
      </div>
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
