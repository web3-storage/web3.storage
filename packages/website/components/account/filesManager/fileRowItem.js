import clsx from 'clsx';
import { useMemo, useState } from 'react';

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
  } = useMemo(() => {
    const propsReturn = { ...props };
    const { target, text = '' } = props.highlight || {};

    // Splitting into highlighted content
    if (!!target && propsReturn[target].indexOf(text) !== -1) {
      propsReturn[target] = propsReturn[target].replace(text, `<span class="highlight">${text}</span>`);
    }

    return propsReturn;
  }, [props]);
  const statusTooltip = useMemo(
    () =>
      ({
        [PinStatus.QUEUING]: 'The upload has been received or is in progress and has not yet been queued for pinning.',
        [PinStatus.PIN_QUEUED]: 'The upload has been received and is in the queue to be pinned.',
        [PinStatus.PINNING]: 'The upload is being replicated to multiple IPFS nodes.',
        [PinStatus.PINNED]: `The upload is fully pinned on ${numberOfPins} IPFS nodes.`,
      }[status]),
    [numberOfPins, status]
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const fileRowLabels = AppData.page_content.file_manager.table.file_row_labels;

  return (
    <div className={clsx('files-manager-row', className, isHeader && 'files-manager-row-header')}>
      <span className="file-select-container">
        <span className="file-select">
          <input checked={isSelected} type="checkbox" id={`${name}-select`} onChange={onSelect} />
          <CheckIcon className="check" />
        </span>
        <button onClick={onDelete} className="file-row-label delete medium-down-only">
          {fileRowLabels.delete}
        </button>
      </span>
      <span className="file-date">
        <span className="file-row-label medium-down-only">{fileRowLabels.date}</span>
        {date}
      </span>
      <span className={clsx(isEditingName && 'isEditingName', 'file-name')}>
        <span className="file-row-label medium-down-only">{fileRowLabels.name}</span>
        {!isEditingName ? (
          <span dangerouslySetInnerHTML={{ __html: name }} />
        ) : (
          <span className="textarea-container">
            <textarea defaultValue={props.name} />
          </span>
        )}

        {!isHeader && <PencilIcon className="pencil-icon" onClick={() => setIsEditingName(!isEditingName)} />}
      </span>
      <span className="file-cid" title={cid}>
        <span className="file-row-label medium-down-only">
          <Info content="The content identifier for a file or a piece of data. <a href='https://docs.web3.storage/concepts/content-addressing/' target='_blank' rel='noreferrer'>Learn more</a>" />
          {fileRowLabels.cid}
        </span>
        <span className="cid-truncate medium-up-only">
          {useMemo(() => truncateString(cid, 5, '...', 'double'), [cid])}
        </span>
        <span className="cid-full medium-down-only">{cid}</span>
        {isHeader ? (
          <Info content="The content identifier for a file or a piece of data. <a href='https://docs.web3.storage/concepts/content-addressing/' target='_blank' rel='noreferrer'>Learn more</a>" />
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
        <span className="file-row-label medium-down-only">{fileRowLabels.available}</span>
        Available
      </span>
      <span className="file-pin-status">
        <span className="file-row-label medium-down-only">
          <Info content="Reports the status of a file or piece of data stored on Web3.Storage’s IPFS nodes." />
          {fileRowLabels.status}
        </span>
        {status}
        {isHeader ? (
          <Info content="Reports the status of a file or piece of data stored on Web3.Storage’s IPFS nodes." />
        ) : (
          statusTooltip && <Info icon={<InfoBIcon />} content="The upload is fully pinned on 3 IPFS nodes." />
        )}
      </span>
      <span className="file-storage-providers">
        <span className="file-row-label medium-down-only">
          <Info content="Service providers offering storage capacity to the Filecoin network. <a href='https://docs.web3.storage/concepts/decentralized-storage/' target='_blank' rel='noreferrer'>Learn more</a>" />
          {fileRowLabels.storage_providers}
        </span>
        {storageProviders}
        {isHeader ? (
          <Info content="Service providers offering storage capacity to the Filecoin network. <a href='https://docs.web3.storage/concepts/decentralized-storage/' target='_blank' rel='noreferrer'>Learn more</a>" />
        ) : (
          !storageProviders.length && (
            <>
              Queuing...
              <Info content="The content from this upload is being aggregated for storage on Filecoin. Filecoin deals will be active within 48 hours of upload." />
            </>
          )
        )}
      </span>
      <span className="file-size">
        <span className="file-row-label medium-down-only">{fileRowLabels.size}</span>
        {size}
      </span>
    </div>
  );
};

export default FileRowItem;
