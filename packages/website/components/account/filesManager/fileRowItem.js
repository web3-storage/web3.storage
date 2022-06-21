import clsx from 'clsx';
import { useMemo, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { BsFillInfoCircleFill } from 'react-icons/bs';

import CheckIcon from '../../../assets/icons/check';
import CopyIcon from '../../../assets/icons/copy';
import PencilIcon from '../../../assets/icons/pencil';
import { addTextToClipboard, formatTimestamp, formatTimestampFull, truncateString } from '../../../lib/utils';
import Tooltip from '../../../modules/zero/components/tooltip/tooltip';
import AppData from '../../../content/pages/app/account.json';

export const PinStatus = {
  PINNED: 'Pinned',
  PINNING: 'Pinning',
  PIN_QUEUED: 'PinQueued',
  QUEUING: 'Queuing...',
};

/**
 * @typedef {Object} FileRowItemProps
 * @property {string} [className]
 * @property {string} date
 * @property {string} name
 * @property {string} cid
 * @property {string} status
 * @property {string} size
 * @property {string | import('react').ReactNode[] | null} storageProviders
 * @property {(e: any)=>void} onSelect
 * @property {(e: any)=>void} onSelect
 * @property {number} [numberOfPins]
 * @property {boolean} [isHeader]
 * @property {boolean} [isSelected]
 * @property {{text: string, target: "name" | "cid"}} [highlight]
 * @property {()=>void} [onDelete]
 * @property {(newFileName?: string) => void} [onEditToggle]
 * @property {boolean} [isEditingName]
 * @property {string?} tabType
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
    tabType,
  } = useMemo(() => {
    const propsReturn = { ...props };
    const { target, text = '' } = props.highlight || {};

    // Splitting into highlighted content
    if (!!target && propsReturn[target].indexOf(text) !== -1) {
      propsReturn[target] = propsReturn[target].replace(text, `<mark class="highlight">${text}</mark>`);
    }

    return propsReturn;
  }, [props]);

  const fileRowLabels = AppData.page_content.file_manager.table.file_row_labels;
  const statusMessages = fileRowLabels.status.tooltip;
  /** @type {import('react').RefObject<HTMLTextAreaElement>} */
  const editingNameRef = useRef(null);
  const truncatedCID = useMemo(() => truncateString(cid, 5, '...', 'double'), [cid]);
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
    <div
      className={clsx(
        'files-manager-row',
        className,
        isHeader && 'files-manager-row-header',
        isSelected && 'files-manager-row-active'
      )}
    >
      <span className={clsx('file-select-container', tabType)}>
        <span className="file-select">
          <input checked={isSelected} type="checkbox" id={`${name}-select`} onChange={onSelect} />
          <CheckIcon className="check" />
        </span>
        <button onClick={onDelete} className="file-row-label delete medium-down-only">
          {fileRowLabels.delete.label}
        </button>
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

        {!isHeader && onEditToggle && (
          <PencilIcon
            className={clsx('pencil-icon', tabType)}
            onClick={() => (isEditingName ? onEditToggle?.(editingNameRef.current?.value) : onEditToggle?.())}
          />
        )}
      </span>
      <span className="file-cid" title={cid}>
        <span className="file-row-label medium-down-only">
          {fileRowLabels.cid.label}
          <Tooltip content={fileRowLabels.cid.tooltip} />
        </span>
        {isHeader ? (
          <span className="cid-full medium-up-only">{cid}</span>
        ) : (
          <a
            className="cid-truncate underline medium-up-only"
            href={`https://dweb.link/ipfs/${cid}`}
            target="_blank"
            rel="noreferrer"
          >
            {truncatedCID}
          </a>
        )}
        <span className="cid-full medium-down-only">{cid}</span>
        {isHeader ? (
          <Tooltip content={fileRowLabels.cid.tooltip} />
        ) : (
          <CopyIcon
            className="copy-icon"
            onClick={() => {
              addTextToClipboard(cid);
            }}
          />
        )}
      </span>
      {/* <span className="file-availability">
        <span className="file-row-label medium-down-only">{fileRowLabels.available.label}</span>
        {isHeader ? 'Availability' : 'Available'}
      </span> */}
      <span className="file-pin-status">
        <span className="file-row-label medium-down-only">
          {fileRowLabels.status.label}
          <Tooltip content={statusMessages.header} />
        </span>
        {status}
        {isHeader ? (
          <Tooltip content={statusMessages.header} />
        ) : (
          statusTooltip && <Tooltip icon={<BsFillInfoCircleFill />} content={statusTooltip} />
        )}
      </span>
      {storageProviders && (
        <span className="file-storage-providers">
          <span className="file-row-label medium-down-only">
            {fileRowLabels.storage_providers.label}
            <Tooltip content={fileRowLabels.storage_providers.tooltip.header} />
          </span>
          {isHeader ? (
            <>
              <span className="th-content">
                <span>{storageProviders}</span>
                <Tooltip
                  position="right"
                  className="tooltip-sp"
                  content={fileRowLabels.storage_providers.tooltip.header}
                />
              </span>
            </>
          ) : !storageProviders.length ? (
            <>
              Queuing...
              <Tooltip
                className="medium-down-only"
                position="left"
                content={fileRowLabels.storage_providers.tooltip.queuing}
              />
              <Tooltip
                className="medium-up-only"
                position="right"
                content={fileRowLabels.storage_providers.tooltip.queuing}
              />
            </>
          ) : (
            <>
              Stored ({storageProviders.length})
              <Tooltip
                className="medium-down-only"
                position="left"
                content={renderToString(<p>{storageProviders}</p>)}
              />
              <Tooltip
                className="medium-up-only"
                position="right"
                content={renderToString(<p>{storageProviders}</p>)}
              />
            </>
          )}
        </span>
      )}
      <span className="file-size">
        <span className="file-row-label medium-down-only">{fileRowLabels.size.label}</span>
        {size}
      </span>
      <span className="file-date">
        {isHeader ? (
          <span>Date</span>
        ) : (
          <>
            <span className="file-row-label medium-down-only">{fileRowLabels.date.label}</span>
            <span title={formatTimestampFull(date)}>{formatTimestamp(date)}</span>
          </>
        )}
      </span>
    </div>
  );
};

export default FileRowItem;
