import { useMemo } from 'react';

import CopyIcon from 'assets/icons/copy';
import { addTextToClipboard, truncateString } from 'lib/utils';

/**
 * @type {import('react').FC}
 * @param {object} props
 * @param {string} props.cid
 * @returns import('react').FC
 */
const CidCellRenderer = ({ cid }) => {
  const truncatedCID = useMemo(() => truncateString(cid, 5, '...', 'double'), [cid]);
  return (
    <span className="cid-cell">
      <a
        className="cid-truncate underline medium-up-only"
        href={`https://dweb.link/ipfs/${cid}`}
        target="_blank"
        rel="noreferrer"
      >
        {truncatedCID}
      </a>
      <button
        className="copy-icon"
        onClick={() => {
          addTextToClipboard(cid);
        }}
      >
        <CopyIcon />
      </button>
    </span>
  );
};

export default CidCellRenderer;
