import { useRouter } from 'next/router';

import NavData from '../../../pages/docs/nav.json';

export default function DocsPagination() {
  const router = useRouter();
  const flatNavData = [];

  NavData.map(primary => {
    return primary.menu.map(secondary => {
      return flatNavData.push(secondary);
    });
  });

  const currentIndex = flatNavData.findIndex(x => x.src === router.pathname.replace('/docs/', ''));

  return (
    <nav className="docs-pagination">
      <div className="prev">
        {currentIndex > 0 && (
          <>
            <div className="sublabel">Previous</div>
            <a href={`/docs/${flatNavData[currentIndex - 1].src}`}>« {flatNavData[currentIndex - 1].name}</a>
          </>
        )}
      </div>
      <div className="next">
        {currentIndex + 1 < flatNavData.length && (
          <>
            <div className="sublabel">Next</div>
            <a href={`/docs/${flatNavData[currentIndex + 1].src}`}>{flatNavData[currentIndex + 1].name} »</a>
          </>
        )}
      </div>
    </nav>
  );
}
