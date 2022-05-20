import clsx from 'clsx';

import CopyIcon from 'assets/icons/copy';
import TrashIcon from 'assets/icons/trash';
import { addTextToClipboard, truncateString } from 'lib/utils';
import TokensData from '../../../content/pages/app/tokens.json';

const tokenRowLabels = TokensData.page_content.tokens_manager.table.token_row_labels;

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
      <span className="file-row-label medium-down-only">{tokenRowLabels.name.label}</span>
      {name}
    </span>
    <span className="token-id-container" title={secret}>
      <span className="file-row-label medium-down-only">{tokenRowLabels.secret.label}</span>
      <span className="token-id">{truncateString(secret, 36, '...', 'double')}</span>
    </span>
    {!isHeader && (
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
    )}
  </div>
);

export default TokenRowItem;
