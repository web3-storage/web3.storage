import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * @typedef {Object} PaginationProps
 * @prop {string} [className]
 * @prop {number} totalRowCount
 * @prop {number} itemsPerPage
 * @prop {number} [visiblePages]
 * @prop {number} page
 * @prop {function} [onPageChange]
 * @prop {string} [scrollTarget]
 */
export default function Pagination({
  className,
  totalRowCount,
  itemsPerPage,
  visiblePages,
  page,
  onPageChange,
  scrollTarget,
}) {
  const [pageList, setPageList] = useState(/** @type {number[]} */ ([]));

  const pageCount = useMemo(() => Math.ceil(totalRowCount / itemsPerPage), [totalRowCount, itemsPerPage]);

  const pageChangeHandler = useCallback(
    page => {
      if (!!scrollTarget) {
        const scrollToElement = document.querySelector(scrollTarget);
        scrollToElement?.scrollIntoView(true);
      }
      onPageChange && onPageChange(page);
    },
    [scrollTarget, onPageChange]
  );
  useEffect(() => {
    setPageList(
      Array.from({ length: pageCount }, (_, i) => i).filter(p => p >= page - visiblePages && p <= page + visiblePages)
    );
  }, [visiblePages, page, pageCount]);

  return (
    <div className={clsx(className, 'Pagination')}>
      <ul className="pageList">
        {page > visiblePages + 1 && (
          <button type="button" className="firstPage" onClick={() => pageChangeHandler(0)}>
            First
          </button>
        )}
        {page > 1 && (
          <button type="button" className="prevPage" onClick={() => pageChangeHandler(page - 1)}>
            Prev
          </button>
        )}
        {page > visiblePages + 1 && <div className="prevEllipses">...</div>}
        {pageCount !== 1 &&
          pageList &&
          pageList.map(p => (
            <button
              type="button"
              key={`page-${p}`}
              className={clsx('page', { current: p === page })}
              onClick={() => pageChangeHandler(p)}
            >
              {p + 1}
            </button>
          ))}
        {pageCount != null && page < pageCount - visiblePages && <div className="nextEllipses">...</div>}
        {pageCount != null && page < pageCount && (
          <button type="button" className="nextPage" onClick={() => pageChangeHandler(page + 1)}>
            Next
          </button>
        )}
        {pageCount != null && page < pageCount - visiblePages && (
          <button type="button" className="lastPage" onClick={() => pageChangeHandler(pageCount)}>
            Last
          </button>
        )}
      </ul>
    </div>
  );
}

Pagination.defaultProps = {
  visiblePages: 1,
};
