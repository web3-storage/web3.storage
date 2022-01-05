// ===================================================================== Imports
import { useRouter } from 'next/router';
import clsx from 'clsx';
import Link from 'next/link';

import GeneralPageData from '../../content/pages/general.json';

// ====================================================================== Params
/**
 * Breadcrumbs
 *
 * @param String variant
 */
// ====================================================================== Export
export default function Breadcrumbs({ variant }) {
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
            <Link href={item.url} className={clsx('breadcrumb', 'breadcrumb-link', variant)}>
              {item.text}
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
