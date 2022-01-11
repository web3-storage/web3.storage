import { useMemo, useCallback, useState, useEffect } from 'react'
import useQueryParams from 'ZeroHooks/useQueryParams'
import clsx from 'clsx'

/**
 * @typedef {Object} PaginationProps
 * @prop {string} [className]
 * @prop {any[]} [items]
 * @prop {number} [itemsPerPage]
 * @prop {number} [visiblePages]
 * @prop {number} [defaultPage]
 * @prop {number} [queryParam]
 * @prop {function} [onChange]
 */

const Pagination = ({
  className,
  items,
  itemsPerPage,
  visiblePages,
  defaultPage,
  queryParam,
  onChange
}) => {
  const [queryValue, setQueryValue] = useQueryParams(queryParam, defaultPage);

  const [pageList, setPageList] = useState([])
  const [activePage, setActivePage] = useState(defaultPage)

  const pageCount = useMemo(() => itemsPerPage ? Math.ceil(items.length/parseInt(itemsPerPage)) : null, [items, itemsPerPage])

  const currentPage = useMemo(() => parseInt(queryParam ? queryValue : activePage), [queryParam, queryValue, activePage])

  const setCurrentPage = useCallback((page) => queryParam ? setQueryValue(page) : setActivePage(page), [queryParam, setQueryValue, setActivePage])

  useEffect(() => {
    pageCount && setPageList(
      Array.from({length: pageCount}, (_, i) => i + 1)
        .filter(page => page >= currentPage - visiblePages && page <= currentPage + visiblePages)
    )

    pageCount && currentPage < 1 && setCurrentPage(defaultPage)
    pageCount && currentPage > pageCount && setCurrentPage(pageCount)

    const firstItem = (currentPage - 1) * parseInt(itemsPerPage)
    onChange && onChange(items.slice(firstItem, firstItem + parseInt(itemsPerPage)))
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
        {pageList && pageList.map((page) => (
          <button type="button"
            key={`page-${page}`}
            className={clsx('page', {current: currentPage === page })}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        {currentPage < pageCount - visiblePages
          && <div className="nextEllipses">...</div>
        }
        {currentPage < pageCount
          && <button type="button" className="nextPage" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        }
        {currentPage < pageCount - visiblePages
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
