import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import CheckIcon from 'assets/icons/check';
import { useUploads } from 'components/contexts/uploadsContext';
import { usePinRequests } from 'components/contexts/pinRequestsContext';
import UploadsTable from './uploadsTable';
import PinRequestsTable from './pinRequestsTable';

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
  const { count: uploadsCount } = useUploads();
  const { count: pinRequestsCount } = usePinRequests();
  const { query, replace } = useRouter();

  const [currentTab, setCurrentTab] = useState('uploaded');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCheckOverlay, setShowCheckOverlay] = useState(false);

  // Set current tab based on url param on load
  useEffect(() => {
    if (query.hasOwnProperty('table') && currentTab !== query?.table) {
      if (typeof query.table === 'string') {
        if (query.table === 'pinned' && pinRequestsCount === 0) {
          delete query.table;
          replace(
            {
              query,
            },
            undefined,
            { shallow: true }
          );
          return;
        }
        setCurrentTab(query.table);
      }
    }
  }, [query, currentTab, pinRequestsCount, replace]);

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
        return uploadsCount;
      case 'pinned':
        return pinRequestsCount;
      default:
        return '';
    }
  };

  const showCheckOverlayHandler = useCallback(() => {
    setShowCheckOverlay(true);
    setTimeout(() => {
      setShowCheckOverlay(false);
    }, 500);
  }, [setShowCheckOverlay]);

  return (
    <div className={clsx('section files-manager-container', className, isUpdating && 'disabled')}>
      {pinRequestsCount > 0 && (
        <div className="upload-pinned-selector">
          {content?.tabs.map(tab => (
            <div key={tab.file_type} className="filetype-tab">
              <button
                disabled={tab.file_type === 'pinned' && pinRequestsCount === 0}
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
      <UploadsTable
        content={content}
        hidden={currentTab !== 'uploaded'}
        onFileUpload={onFileUpload}
        onUpdatingChange={setIsUpdating}
        showCheckOverlay={showCheckOverlayHandler}
      />
      <PinRequestsTable
        content={content}
        hidden={currentTab !== 'pinned'}
        onUpdatingChange={setIsUpdating}
        showCheckOverlay={showCheckOverlayHandler}
      />
      {/*
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
        <Dropdown
          className="files-manager-gateway"
          staticLabel="Gateway"
          value={linkPrefix}
          options={[
            { value: 'https://w3s.link/ipfs/', label: 'w3link' },
            { value: 'https://dweb.link/ipfs/', label: 'dweb' },
          ]}
          onChange={value => setLinkPrefix(value)}
        />
      </div>
      <FileRowItem
        onSelect={onSelectAllToggle}
        date={fileRowLabels.date.label}
        name={fileRowLabels.name.label}
        cid={fileRowLabels.cid.label}
        storageProviders={currentTab === 'uploaded' ? fileRowLabels.storage_providers.label : null}
        size={fileRowLabels.size.label}
        linkPrefix={linkPrefix}
        isHeader
        isSelected={
          !!selectedFiles.length &&
          paginatedFiles.every(file => selectedFiles.find(fileSelected => file === fileSelected)) &&
          !!fetchDate
        }
        tabType={currentTab}
      />
      <div className="files-manager-table-content">
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
              linkPrefix={linkPrefix}
              highlight={{ target: 'name', text: keyword?.toString() || '' }}
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
      </Modal> */}

      <div className={clsx('files-manager-overlay', showCheckOverlay ? 'show' : '')}>
        <div className="files-manager-overlay-check">
          <CheckIcon />
        </div>
      </div>
    </div>
  );
};

export default FilesManager;
