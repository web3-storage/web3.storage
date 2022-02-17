import clsx from 'clsx';
import { useMemo, useRef } from 'react';

import CheckIcon from 'assets/icons/check';
import InfoAIcon from 'assets/icons/infoA';
import InfoBIcon from 'assets/icons/infoB';
import CopyIcon from 'assets/icons/copy';
import PencilIcon from 'assets/icons/pencil';
import { addTextToClipboard, truncateString } from 'lib/utils';
import AppData from '../../../content/pages/app/account.json';

export const PinStatus = {
  PINNED: 'Pinned',
  PINNING: 'Pinning',
  PIN_QUEUED: 'PinQueued',
  QUEUING: 'Queuing...',
};

/**
 * @typedef {Object} InfoProps
 * @property {string} content
 * @property {React.ReactNode} [icon]
 */

/**
 *
 * @param {InfoProps} props
 * @returns
 */
const Info = ({ content, icon = null }) => (
  <div className="info-container">
    {icon || <InfoAIcon />}
    <span className="info-tooltip" dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);

/**
 * @typedef {Object} FileRowItemProps
 * @property {string} [className]
 * @property {string} date
 * @property {string} name
 * @property {string} cid
 * @property {string} status
 * @property {string} size
 * @property {string | import('react').ReactNode[]} storageProviders
 * @property {(e: any)=>void} onSelect
 * @property {number} [numberOfPins]
 * @property {boolean} [isHeader]
 * @property {boolean} [isSelected]
 * @property {{text: string, target: "name" | "cid"}} [highlight]
 * @property {()=>void} [onDelete]
 * @property {(newFileName?: string) => void} [onEditToggle]
 * @property {boolean} [isEditingName]
 */

/**
 *
 * @param {FileRowItemProps} props
 * @returns
 */
const FileRowItem = props => {
  const {
    className = '',
    date,
    name,
    cid,
    status,
    storageProviders,
    size,
    onSelect,
    numberOfPins,
    isHeader = false,
    isSelected,
    onDelete,
    onEditToggle,
    isEditingName,
  } = useMemo(() => {
    const propsReturn = { ...props };
    const { target, text = '' } = props.highlight || {};

    // Splitting into highlighted content
    if (!!target && propsReturn[target].indexOf(text) !== -1) {
      propsReturn[target] = propsReturn[target].replace(text, `<span class="highlight">${text}</span>`);
    }

    return propsReturn;
  }, [props]);

  const fileRowLabels = AppData.page_content.file_manager.table.file_row_labels;
  const statusMessages = fileRowLabels.status.tooltip;
  /** @type {import('react').RefObject<HTMLTextAreaElement>} */
  const editingNameRef = useRef(null);
  const statusTooltip = useMemo(
    () =>
      ({
        [PinStatus.QUEUING]: statusMessages.queuing,
        [PinStatus.PIN_QUEUED]: statusMessages.pin_queued,
        [PinStatus.PINNING]: statusMessages.pinning,
        [PinStatus.PINNED]: statusMessages.pinned.replace('*numberOfPins*', `${numberOfPins}`),
      }[status]),
    [numberOfPins, status, statusMessages]
  );

  return (
    <div className={clsx('files-manager-row', className, isHeader && 'files-manager-row-header')}>
      <span className="file-select-container">
        <span className="file-select">
          <input checked={isSelected} type="checkbox" id={`${name}-select`} onChange={onSelect} />
          <CheckIcon className="check" />
        </span>
        <button onClick={onDelete} className="file-row-label delete medium-down-only">
          {fileRowLabels.delete.label}
        </button>
      </span>
      <span className="file-date">
        <span className="file-row-label medium-down-only">{fileRowLabels.date.label}</span>
        {date}
      </span>
      <span className={clsx(isEditingName && 'isEditingName', 'file-name')}>
        <span className="file-row-label medium-down-only">{fileRowLabels.name.label}</span>
        {!isEditingName ? (
          <span dangerouslySetInnerHTML={{ __html: name }} />
        ) : (
          <span className="textarea-container">
            <textarea ref={editingNameRef} defaultValue={props.name} />
          </span>
        )}

        {!isHeader && (
          <PencilIcon
            className="pencil-icon"
            onClick={() => (isEditingName ? onEditToggle?.(editingNameRef.current?.value) : onEditToggle?.())}
          />
        )}
      </span>
      <span className="file-cid" title={cid}>
        <span className="file-row-label medium-down-only">
          <Info content={fileRowLabels.cid.tooltip} />
          {fileRowLabels.cid.label}
        </span>
        <span className="cid-truncate medium-up-only">
          {useMemo(() => truncateString(cid, 5, '...', 'double'), [cid])}
        </span>
        <span className="cid-full medium-down-only">{cid}</span>
        {isHeader ? (
          <Info content={fileRowLabels.cid.tooltip} />
        ) : (
          <CopyIcon
            className="copy-icon"
            onClick={() => {
              addTextToClipboard(cid);
            }}
          />
        )}
      </span>
      <span className="file-availability">
        <span className="file-row-label medium-down-only">{fileRowLabels.available.label}</span>
        Availability
      </span>
      <span className="file-pin-status">
        <span className="file-row-label medium-down-only">
          <Info content={statusMessages.header} />
          {fileRowLabels.status.label}
        </span>
        {status}
        {isHeader ? (
          <Info content={statusMessages.header} />
        ) : (
          statusTooltip && <Info icon={<InfoBIcon />} content={statusTooltip} />
        )}
      </span>
      <span className="file-storage-providers">
        <span className="file-row-label medium-down-only">
          <Info content={fileRowLabels.storage_providers.tooltip.header} />
          {fileRowLabels.storage_providers.label}
        </span>
        {storageProviders}
        {isHeader ? (
          <Info content={fileRowLabels.storage_providers.tooltip.header} />
        ) : (
          !storageProviders.length && (
            <>
              Queuing...
              <Info content={fileRowLabels.storage_providers.tooltip.queuing} />
            </>
          )
        )}
      </span>
      <span className="file-size">
        <span className="file-row-label medium-down-only">{fileRowLabels.size.label}</span>
        {size}
      </span>
    </div>
  );
};

export default FileRowItem;
