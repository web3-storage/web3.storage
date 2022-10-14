import { useMemo } from 'react';

import CopyIcon from 'assets/icons/copy';
import { addTextToClipboard, truncateString } from 'lib/utils';

/**
 * @type {import('react').FC}
 *
 * Used to render a checkbox cell within a table component.
 *
 * @param {Object} props
 * @returns
 */
function CidCellRenderer({ cid }) {
  const truncatedCID = useMemo(() => truncateString(cid, 5, '...', 'double'), [cid]);
  return (
    <span className="cid-cell">
      <a className="cid-truncate underline" href={`https://dweb.link/ipfs/${cid}`} target="_blank" rel="noreferrer">
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
}

export default CidCellRenderer;
