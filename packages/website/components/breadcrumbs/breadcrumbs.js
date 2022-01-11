// ===================================================================== Imports
import { useRouter } from 'next/router';
import clsx from 'clsx';
import Link from 'next/link';

import GeneralPageData from '../../content/pages/general.json';

// ====================================================================== Params
/**
 * Breadcrumbs
 *
 * @param String props.variant
 * @param function props.click
 * @param function props.keyboard
 */
// ====================================================================== Export
export default function Breadcrumbs({ variant, click, keyboard }) {
  const router = useRouter();
  const breadcrumbs = GeneralPageData.breadcrumbs;
  const routeName = router.route.replace('/', '');
  const links = [
    {
      url: '/',
      text: breadcrumbs.index,
    },
  ];

  if (breadcrumbs.hasOwnProperty(routeName)) {
    links.push({ text: breadcrumbs[routeName] });
  }

  return (
    <div className="breadcrumbs">
      {links.map(item => (
        <div key={item.text} className="breadcrumb-wrapper">
          {item.url ? (
            <Link href={item.url}>
              <button
                className={clsx('breadcrumb', 'breadcrumb-link', variant)}
                onClick={e => click(e)}
                onKeyPress={e => keyboard(e, item.url)}
              >
                {item.text}
              </button>
            </Link>
          ) : (
            <div className={clsx('breadcrumb', 'breadcrumb-text', variant)}>{item.text}</div>
          )}

          <div className={clsx('breadcrumb-divider', variant)}>{item.url}</div>
        </div>
      ))}
    </div>
  );
}
