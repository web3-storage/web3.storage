import { useRouter } from 'next/router';

import Link from '../../../components/link/link';
import NavData from '../../../pages/docs/nav.json';
import NavDataV2 from '../../../pages/docs/v2/nav.json';

export default function Sidebar({ openMenu }) {
  const router = useRouter();

  const isV2 = router.pathname.includes("/v2")
  const data = isV2
    ? NavDataV2
    : NavData

  const basePath = isV2 ? "/docs/v2" : "/docs"

  return (
    <aside className="sidebar">
      <div className="sidebar-wrapper">
        {data.map((primary, idx) => (
          <div key={`primary-${idx}`} className={primary.name === '' ? 'no-heading' : ''}>
            {primary.name && <h3>{primary.name}</h3>}
            {primary.menu.map((secondary, idx) => (
              <Link
                onClick={openMenu ? () => openMenu(false) : undefined}
                className={router.pathname === `${basePath}/${secondary.src}` ? 'active' : ''}
                key={`secondary-${idx}`}
                href={`${basePath}/${secondary.src}`}
              >
                {secondary.name}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
