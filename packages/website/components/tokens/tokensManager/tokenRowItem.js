import clsx from 'clsx';

import CopyIcon from 'assets/icons/copy';
import TrashIcon from 'assets/icons/trash';
import { addTextToClipboard, truncateString } from 'lib/utils';

/**
 * @typedef {Object} TokenRowItemProps
 * @property {string} [className]
 * @property {string} name
 * @property {string} secret
 * @property {string} [id]
 * @property {(id: string)=>void} [onTokenDelete]
 * @property {string} [deletingTokenId]
 * @property {boolean} [isHeader]
 */

/**
 *
 * @param {TokenRowItemProps} props
 * @returns
 */
const TokenRowItem = ({ className = '', name, secret, id, isHeader, onTokenDelete, deletingTokenId }) => (
  <div
    className={clsx(
      'tokens-manager-row',
      className,
      isHeader && 'tokens-manager-header',
      !!deletingTokenId && 'isDeleting'
    )}
  >
    <span className="token-name" title={name}>
      {name}
    </span>
    <span className="token-id" title={secret}>
      {truncateString(secret, 22, '...', 'double')}
    </span>
    {!isHeader && (
      <>
        {deletingTokenId !== id ? (
          <div className="token-actions">
            <CopyIcon onClick={() => addTextToClipboard(secret)} />
            <TrashIcon onClick={onTokenDelete} />
          </div>
        ) : (
          'Deleting...'
        )}
      </>
    )}
  </div>
);

export default TokenRowItem;
