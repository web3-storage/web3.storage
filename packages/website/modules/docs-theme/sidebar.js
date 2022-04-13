import Link from 'next/link';

import NavData from '../../pages/docs/nav.json';

export default function Sidebar() {
  return (
    <div>
      <ul>
        {NavData.map((primary, idx) => (
          <li key={`primary-${idx}`} className="">
            <span>{primary.name}</span>
            {primary.menu.map((secondary, idx) => (
              <Link key={`secondary-${idx}`} href={`/docs/${secondary.src}`}>
                {secondary.name}
              </Link>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
