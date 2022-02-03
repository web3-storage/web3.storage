import clsx from 'clsx';

import CopyIcon from 'assets/icons/copy';
import TrashIcon from 'assets/icons/trash';
import { addTextToClipboard, truncateString } from 'lib/utils';
import { tokenRowLabels } from 'components/tokens/tokensManager/tokenRowLabels.const.js';

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
      <span className="file-row-label medium-down-only">{tokenRowLabels.NAME}</span>
      {name}
    </span>
    <span className="token-id-container" title={secret}>
      <span className="file-row-label medium-down-only">{tokenRowLabels.SECRET}</span>
      <span className="token-id">{truncateString(secret, 36, '...', 'double')}</span>
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
