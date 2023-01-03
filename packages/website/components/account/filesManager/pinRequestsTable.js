import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';

import analytics, { saEvent } from 'lib/analytics';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import { ServerPagination } from 'ZeroComponents/pagination/pagination';
import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';
import { useUser } from 'components/contexts/userContext';
import RefreshIcon from 'assets/icons/refresh';
import { usePinRequests } from 'components/contexts/pinRequestsContext';
import PinRequestRowItem from './pinRequestRowItem';
import GradientBackground from '../../gradientbackground/gradientbackground.js';

/**
 * @typedef {Object} PinRequestsTableProps
 * @prop {any} [content]
 * @prop {boolean} hidden
 * @prop {(isUpdating: boolean) => void} onUpdatingChange
 * @prop {() => void} showCheckOverlay
 */

/**
 * @param {PinRequestsTableProps} props
 */
const PinRequestsTable = ({ content, hidden, onUpdatingChange, showCheckOverlay }) => {
  const { pinRequests, pages, fetchDate, getPinRequests, isFetching, deletePinRequest } = usePinRequests();
  const {
    storageData: { refetch },
  } = useUser();

  const [status] = useState('queued,pinning,pinned,failed');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [linkPrefix, setLinkPrefix] = useState('w3s.link/ipfs/');
  const [deleteSingleRequestid, setDeleteSingleRequestid] = useState('');
  const deleteModalState = useState(false);

  const [selectedPinRequests, setSelectedPinRequests] = useState(
    /** @type {import('../../contexts/pinRequestsContext').PinStatus[]} */ ([])
  );
  const fileRowLabels = content?.table.file_row_labels;

  useEffect(() => {
    getPinRequests({ status, page, size });
    setSelectedPinRequests([]);
  }, [getPinRequests, status, page, size]);

  const onSelectAllToggle = useCallback(
    e => {
      const pinRequestsToSelect = pinRequests.filter(pr => !selectedPinRequests.some(selected => selected === pr));

      if (!pinRequestsToSelect.length) {
        return setSelectedPinRequests([]);
      }

      return setSelectedPinRequests(selectedPinRequests.concat(pinRequestsToSelect));
    },
    [selectedPinRequests, setSelectedPinRequests, pinRequests]
  );

  const onPinRequestSelect = useCallback(
    /** @type {import('components/contexts/pinRequestsContext').PinStatus} */ pinRequest => {
      const selectedIndex = selectedPinRequests.findIndex(selected => selected === pinRequest);
      if (selectedIndex !== -1) {
        selectedPinRequests.splice(selectedIndex, 1);
        return setSelectedPinRequests([...selectedPinRequests]);
      }

      setSelectedPinRequests([...selectedPinRequests, pinRequest]);
    },
    [selectedPinRequests, setSelectedPinRequests]
  );

  const closeDeleteModal = useCallback(() => {
    deleteModalState[1](false);
    saEvent(analytics.events.FILE_DELETE_CLICK, {
      ui: analytics.ui.FILES,
      totalDeleted: 0,
    });
  }, [deleteModalState]);

  const onDeleteSelected = useCallback(async () => {
    onUpdatingChange(true);

    try {
      if (deleteSingleRequestid !== '') {
        await deletePinRequest(deleteSingleRequestid);
      } else {
        await Promise.all(selectedPinRequests.map(({ requestid }) => deletePinRequest(requestid)));
      }
    } catch (e) {}
    saEvent(analytics.events.FILE_DELETE_CLICK, {
      ui: analytics.ui.FILES,
      totalDeleted: selectedPinRequests.length,
    });

    onUpdatingChange(false);
    setSelectedPinRequests([]);

    getPinRequests({ status, page, size });
    setDeleteSingleRequestid('');
    deleteModalState[1](false);
    refetch();
  }, [
    onUpdatingChange,
    selectedPinRequests,
    getPinRequests,
    status,
    page,
    size,
    deleteModalState,
    refetch,
    deleteSingleRequestid,
    deletePinRequest,
  ]);

  const onDeleteSingle = useCallback(
    async requestid => {
      deleteModalState[1](true);
      setDeleteSingleRequestid(requestid);
    },
    [deleteModalState]
  );

  const refreshHandler = useCallback(() => {
    getPinRequests({ status, page, size });
    showCheckOverlay();
  }, [getPinRequests, status, page, size, showCheckOverlay]);

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="files-manager-header">
        <div className="files-manager-title has-upload-button">
          <div className="title">Pin Requests</div>
        </div>
        <button className={clsx('refresh', isFetching && 'disabled')} onClick={refreshHandler}>
          <RefreshIcon />
          <span>{content?.ui.refresh}</span>
        </button>
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
      <PinRequestRowItem
        onSelect={onSelectAllToggle}
        date={fileRowLabels.date.label}
        name={fileRowLabels.name.label}
        cid={fileRowLabels.cid.label}
        requestid={fileRowLabels.requestid.label}
        status={fileRowLabels.status.label}
        linkPrefix={linkPrefix}
        isHeader
        isSelected={
          !!selectedPinRequests.length &&
          pinRequests.every(file => selectedPinRequests.find(fileSelected => file === fileSelected)) &&
          !!fetchDate
        }
      />
      <div className="files-manager-table-content">
        {isFetching || !fetchDate ? (
          <Loading className={'files-loading-spinner'} />
        ) : (
          pinRequests.map(item => (
            <PinRequestRowItem
              key={item.requestid}
              onSelect={() => onPinRequestSelect(item)}
              date={item.created}
              name={item.pin.name || 'No Name'}
              cid={item.pin.cid}
              requestid={item.requestid}
              status={item.status}
              linkPrefix={linkPrefix}
              isSelected={!!selectedPinRequests.find(fileSelected => fileSelected === item)}
              onDelete={() => onDeleteSingle(item.requestid)}
            />
          ))
        )}
      </div>
      {!!pinRequests.length && (
        <div className="files-manager-footer">
          <button
            className={clsx('delete', !selectedPinRequests.length && 'disabled')}
            onClick={() => deleteModalState[1](true)}
          >
            {content?.ui.delete.text}
          </button>
          <ServerPagination
            className="files-manager-pagination"
            itemsPerPage={size}
            visiblePages={1}
            pageCount={pages}
            queryParam="pinned-page"
            onChange={setPage}
            scrollTarget={'.account-files-manager'}
          />
          <Dropdown
            className="files-manager-result-dropdown"
            value={content?.ui.results.options[0].value}
            options={content?.ui.results.options}
            queryParam="pinned-items"
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

export default PinRequestsTable;
