import { useRouter } from 'next/router';
import clsx from 'clsx';

import Link from '../link/link';
import GeneralPageData from '../../content/pages/general.json';

/**
 * Breadcrumbs
 *
 * @param String props.variant
 * @callback props.click
 */
export default function Breadcrumbs({ variant, click }) {
  const router = useRouter();
  const breadcrumbs = GeneralPageData.breadcrumbs;
  const routeName = router.route.replace('/', '');
  const links = [
    {
      url: '/',
      text: breadcrumbs.index,
    },
  ];

  if (routeName.includes('docs')) {
    links.push({ url: '', text: breadcrumbs.docs });
  }
  if (routeName.includes('blog/post')) {
    links.push({ url: '/blog', text: breadcrumbs.blog });
    links.push({ url: '', text: 'Article' });
  }
  if (breadcrumbs.hasOwnProperty(routeName)) {
    links.push({ url: '', text: breadcrumbs[routeName] });
  }

  return (
    <div className="breadcrumbs">
      {links.map(item => (
        <div key={item.text} className="breadcrumb-wrapper">
          {item.url ? (
            <Link href={item.url} className={clsx('breadcrumb', 'breadcrumb-link', variant)} onClick={click}>
              {item.text}
            </Link>
          ) : (
            <div className={clsx('breadcrumb', 'breadcrumb-text', variant)}>{item.text}</div>
          )}

          <div className={clsx('breadcrumb-divider', variant)}>/</div>
        </div>
      ))}
    </div>
  );
}
