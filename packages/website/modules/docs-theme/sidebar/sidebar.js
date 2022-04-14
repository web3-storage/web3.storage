import Link from 'next/link';
import { useRouter } from 'next/router';

import NavData from '../../../pages/docs/nav.json';

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div className="sidebar-wrapper">
        {NavData.map((primary, idx) => (
          <div key={`primary-${idx}`} className="">
            {primary.name && <h3>{primary.name}</h3>}
            <div>
              {primary.menu.map((secondary, idx) => (
                <Link key={`secondary-${idx}`} href={`/docs/${secondary.src}`}>
                  <a
                    href={`/docs/${secondary.src}`}
                    className={router.pathname === `/docs/${secondary.src}` ? 'active' : ''}
                  >
                    {secondary.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
