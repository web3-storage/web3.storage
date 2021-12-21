import clsx from 'clsx';

// import CopyIcon from 'assets/icons/copy';
// import { addTextToClipboard, truncateString } from 'lib/utils';

/**
 * @typedef {Object} TokenRowItemProps
 * @property {string} [className]
 * @property {string} name
 * @property {string} secret
 * @property {boolean} [isHeader]
 */

/**
 *
 * @param {TokenRowItemProps} props
 * @returns
 */
const TokenRowItem = ({ className = '', name, secret, isHeader }) => (
  <div className={clsx('tokens-manager-row', className, isHeader && 'tokens-manager-header')}>
    <span className="token-name">{name}</span>
    <span className="token-id">{secret}</span>
  </div>
);

export default TokenRowItem;
