import clsx from 'clsx'
import { useMemo, useCallback, useState, useEffect } from 'react'

import useQueryParams from 'ZeroHooks/useQueryParams'

/**
 * @typedef {Object} PaginationProps
 * @prop {string} [className]
 * @prop {any[]} items
 * @prop {string|number} itemsPerPage
 * @prop {number} visiblePages
 * @prop {number} [defaultPage]
 * @prop {string} [queryParam]
 * @prop {function} [onChange]
 * @prop {string} [scrollTarget]
 */

/**
 * @param {PaginationProps} props
 */
const Pagination = ({
  className,
  items,
  itemsPerPage,
  visiblePages,
  defaultPage,
  queryParam,
  onChange,
  scrollTarget,
}) => {
  const [queryValue, setQueryValue] = useQueryParams(queryParam, defaultPage);

  const [pageList, setPageList] = useState(/** @type {number[]} */([]))
  const [activePage, setActivePage] = useState(defaultPage)

  const pageCount = useMemo(() => itemsPerPage ? Math.ceil(items.length/parseInt(/** @type {string} */(itemsPerPage))) : null, [items, itemsPerPage])

  const currentPage = useMemo(() => parseInt(queryParam ? queryValue : activePage), [queryParam, queryValue, activePage])

  const setCurrentPage = useCallback((page) => {
    queryParam ? setQueryValue(page) : setActivePage(page)
    if(!!scrollTarget) {
      const scrollToElement= document.querySelector(scrollTarget);
      scrollToElement?.scrollIntoView(true);
    }
  }, [queryParam, setQueryValue, setActivePage, scrollTarget])

  useEffect(() => {
    pageCount && setPageList(
      Array.from({length: pageCount}, (_, i) => i + 1)
        .filter(page => page >= currentPage - visiblePages && page <= currentPage + visiblePages)
    )

    pageCount && currentPage < 1 && setCurrentPage(defaultPage)
    pageCount && currentPage > pageCount && setCurrentPage(pageCount)

    const firstItem = (currentPage - 1) * parseInt(/** @type {string} */(itemsPerPage))
    onChange && onChange(items.slice(firstItem, firstItem + parseInt(/** @type {string} */(itemsPerPage))))

  }, [items, itemsPerPage, visiblePages, pageCount, setPageList, currentPage, setCurrentPage, onChange])

  return (
    <div className={clsx(className, 'Pagination')}>
      <ul className="pageList">
        {currentPage > visiblePages + 1
          && <button type="button" className="firstPage" onClick={() => setCurrentPage(1)}>First</button>
        }
        {currentPage > 1
          && <button type="button" className="prevPage" onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
        }
        {currentPage > visiblePages + 1
          && <div className="prevEllipses">...</div>
        }
        {pageCount !== 1 && pageList && pageList.map((page) => (
          <button type="button"
            key={`page-${page}`}
            className={clsx('page', {current: currentPage === page })}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        {pageCount != null && currentPage < pageCount - visiblePages
          && <div className="nextEllipses">...</div>
        }
        {pageCount != null && currentPage < pageCount
          && <button type="button" className="nextPage" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        }
        {pageCount != null && currentPage < pageCount - visiblePages
          && <button type="button" className="lastPage" onClick={() => setCurrentPage(pageCount)}>Last</button>
        }
      </ul>
    </div>
  )
}

Pagination.defaultProps = {
  items: [],
  itemsPerPage: 10,
  defaultPage: 1,
  queryParam: null
}

export default Pagination

/**
 * @typedef {Object} ServerPaginationProps
 * @prop {string} [className]
 * @prop {string|number} itemsPerPage
 * @prop {number} pageCount
 * @prop {number} visiblePages
 * @prop {number} [defaultPage]
 * @prop {string} [queryParam]
 * @prop {(page: number) => void} [onChange]
 * @prop {string} [scrollTarget]
 */

/**
 * @param {ServerPaginationProps} props
 */
export const ServerPagination = ({
  className,
  itemsPerPage,
  pageCount,
  visiblePages,
  defaultPage,
  queryParam,
  onChange,
  scrollTarget,
}) => {
  const [queryValue, setQueryValue] = useQueryParams(queryParam, defaultPage);

  const [pageList, setPageList] = useState(/** @type {number[]} */([]))
  const [activePage, setActivePage] = useState(defaultPage)

  const currentPage = useMemo(() => parseInt(queryParam ? queryValue : activePage), [queryParam, queryValue, activePage])

  const setCurrentPage = useCallback((page) => {
    queryParam ? setQueryValue(page) : setActivePage(page)
    if(scrollTarget) {
      document.querySelector(scrollTarget)?.scrollIntoView(true)
    }
    onChange && onChange(page);
  }, [queryParam, setQueryValue, setActivePage, scrollTarget])

  useEffect(() => {
    pageCount && setPageList(
      Array.from({length: pageCount}, (_, i) => i + 1)
        .filter(page => page >= currentPage - visiblePages && page <= currentPage + visiblePages)
    )
  }, [itemsPerPage, visiblePages, pageCount, setPageList, currentPage, setCurrentPage, onChange])

  return (
    <div className={clsx(className, 'Pagination')}>
      <ul className="pageList">
        {currentPage > visiblePages + 1
          && <button type="button" className="firstPage" onClick={() => setCurrentPage(1)}>First</button>
        }
        {currentPage > 1
          && <button type="button" className="prevPage" onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
        }
        {currentPage > visiblePages + 1
          && <div className="prevEllipses">...</div>
        }
        {pageCount !== 1 && pageList && pageList.map((page) => (
          <button type="button"
            key={`page-${page}`}
            className={clsx('page', {current: currentPage === page })}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        {pageCount != null && currentPage < pageCount - visiblePages
          && <div className="nextEllipses">...</div>
        }
        {pageCount != null && currentPage < pageCount
          && <button type="button" className="nextPage" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        }
        {pageCount != null && currentPage < pageCount - visiblePages
          && <button type="button" className="lastPage" onClick={() => setCurrentPage(pageCount)}>Last</button>
        }
      </ul>
    </div>
  )
}

ServerPagination.defaultProps = {
  itemsPerPage: 10,
  defaultPage: 1,
  queryParam: null
}
