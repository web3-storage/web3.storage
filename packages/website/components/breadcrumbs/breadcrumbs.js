import clsx from 'clsx';

import Link from '../link/link';

/** @typedef {Object} Breadcrumb = {url: string, text: string} */

/**
 * Breadcrumbs
 *
 * @param {Object} props
 * @param {String} props.variant
 * @param {Object} [props.items]
 * @param {React.MouseEventHandler<HTMLAnchorElement>} props.click
 */
export default function Breadcrumbs({ variant, click, items }) {
  return (
    <div className="breadcrumbs">
      {items.map((item, idx) => (
        <div key={item.text} className="breadcrumb-wrapper">
          {idx !== items.length - 1 ? (
            <Link href={item.url} className={clsx('breadcrumb', 'breadcrumb-link', variant)} onClick={click}>
              {item.text}
            </Link>
          ) : (
            <div className={clsx('breadcrumb', 'breadcrumb-text', variant)}>{item.text}</div>
          )}

          {idx !== items.length - 1 && <div className={clsx('breadcrumb-divider', variant)}>/</div>}
        </div>
      ))}
    </div>
  );
}
