import { useRouter } from 'next/router';

import Link from '../../../components/link/link';
import NavData from '../../../pages/docs/nav.json';

export default function Sidebar({ openMenu }) {
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div className="sidebar-wrapper">
        {NavData.map((primary, idx) => (
          <div key={`primary-${idx}`} className={primary.name === '' ? 'no-heading' : ''}>
            {primary.name && <h3>{primary.name}</h3>}
            {primary.menu.map((secondary, idx) => (
              <Link
                onClick={openMenu ? () => openMenu(false) : undefined}
                className={router.pathname === `/docs/${secondary.src}` ? 'active' : ''}
                key={`secondary-${idx}`}
                href={`/docs/${secondary.src}`}
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
