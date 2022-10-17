import { useMemo } from 'react';

import CopyIcon from 'assets/icons/copy';
import { addTextToClipboard, truncateString } from 'lib/utils';

/**
 * @type {import('react').FC}
 * Used to render a checkbox cell within a table component.
 * @param {Object} props
 * @param {string} props.cid the CID of the upload.
 * @param {string} props.gatewayPrefix the gateway prefix used for linking to the file in a gateway.
 * @returns
 */
function CidCellRenderer({ cid, gatewayPrefix }) {
  const truncatedCID = useMemo(() => truncateString(cid, 5, '...', 'double'), [cid]);
  return (
    <span className="cid-cell">
      <a className="cid-truncate underline" href={`${gatewayPrefix}${cid}`} target="_blank" rel="noreferrer">
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
