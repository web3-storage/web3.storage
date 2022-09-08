import clsx from 'clsx';
import { useMemo } from 'react';

import CheckIcon from '../../../assets/icons/check';
import CopyIcon from '../../../assets/icons/copy';
import { addTextToClipboard, formatTimestamp, formatTimestampFull, truncateString } from '../../../lib/utils';
import Tooltip from '../../../modules/zero/components/tooltip/tooltip';
import AppData from '../../../content/pages/app/account.json';

export const PinStatus = {
  PINNED: 'pinned',
  PINNING: 'pinning',
  PIN_QUEUED: 'queued',
  FAILED: 'failed',
};

/**
 * @typedef {Object} PinRequestRowItem
 * @property {string} [className]
 * @property {string} date
 * @property {string} name
 * @property {string} cid
 * @property {string} requestid
 * @property {string} status
 * @property {string} linkPrefix
 * @property {(e: any)=>void} onSelect
 * @property {boolean} [isHeader]
 * @property {boolean} [isSelected]
 * @property {() => void} [onDelete]
 */

/**
 * @param {PinRequestRowItem} props
 */
const PinRequestRowItem = ({
  className = '',
  date,
  name,
  cid,
  requestid,
  status,
  linkPrefix,
  onSelect,
  isHeader = false,
  isSelected,
  onDelete,
}) => {
  const fileRowLabels = AppData.page_content.file_manager.table.file_row_labels;
  const truncatedCID = useMemo(() => truncateString(cid, 5, '...', 'double'), [cid]);
  const truncatedRequestid = useMemo(() => truncateString(requestid, 5, '...', 'double'), [requestid]);

  return (
    <div
      className={clsx(
        'files-manager-row',
        'pin-request-row',
        className,
        isHeader && 'files-manager-row-header',
        isSelected && 'files-manager-row-active'
      )}
    >
      <span className={clsx('file-select-container')}>
        <span className="file-select">
          <input checked={isSelected} type="checkbox" id={`${name}-select`} onChange={onSelect} />
          <CheckIcon className="check" />
        </span>
        <button onClick={onDelete} className="file-row-label delete medium-down-only">
          {fileRowLabels.delete.label}
        </button>
      </span>
      <span className={clsx('file-name')}>
        <span className="file-row-label medium-down-only">{fileRowLabels.name.label}</span>
        <span>{name}</span>
      </span>
      <span className="file-requestid" title={requestid}>
        <span className="file-row-label medium-down-only">
          {fileRowLabels.requestid.label}
          <Tooltip content={fileRowLabels.requestid.tooltip} />
        </span>
        {isHeader ? (
          <span className="requestid-full medium-up-only">{requestid}</span>
        ) : (
          <span className="requestid-truncate medium-up-only">{truncatedRequestid}</span>
        )}
        <span className="requestid-full medium-down-only">{truncatedRequestid}</span>
        {isHeader ? (
          <Tooltip content={fileRowLabels.requestid.tooltip} />
        ) : (
          <CopyIcon
            className="copy-icon"
            onClick={() => {
              addTextToClipboard(requestid);
            }}
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
            href={`${linkPrefix}${cid}`}
            target="_blank"
            rel="noreferrer noopener"
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
      {/* <span className="file-pin-status">
        <span className="file-row-label medium-down-only">
          {fileRowLabels.status.label}
          <Tooltip content={statusMessages.header} />
        </span>
        {`${status[0].toUpperCase()}${status.slice(1)}`}
        {isHeader ? (
          <Tooltip content={statusMessages.header} />
        ) : (
          statusTooltip && <Tooltip icon={<BsFillInfoCircleFill />} content={statusTooltip} />
        )}
      </span> */}
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

export default PinRequestRowItem;
