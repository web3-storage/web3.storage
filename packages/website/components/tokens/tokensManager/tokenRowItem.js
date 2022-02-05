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
const TokenRowItem = ({ className = '', name, secret, id = '', isHeader, onTokenDelete, deletingTokenId }) => (
  <div
    className={clsx(
      'tokens-manager-row',
      className,
      isHeader && 'tokens-manager-row-header',
      !!deletingTokenId && 'isDisabled'
    )}
  >
    <span className="token-name" title={name}>
      {name}
    </span>
    <span className="token-id" title={secret}>
      {truncateString(secret, 36, '...', 'double')}
    </span>
    {!isHeader && (
      <>
        {deletingTokenId !== id ? (
          <>
            <div className="token-copy">
              <button onClick={() => addTextToClipboard(secret)}>
                <CopyIcon />
              </button>
            </div>
            <div className="token-delete">
              <button onClick={() => onTokenDelete?.(id)}>
                <TrashIcon />
              </button>
            </div>
          </>
        ) : (
          'Deleting...'
        )}
      </>
    )}
  </div>
);

export default TokenRowItem;
