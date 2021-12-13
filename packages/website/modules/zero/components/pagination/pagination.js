import { useCallback, Fragment, useState, useEffect } from 'react'
import clsx from 'clsx'

/**
 * @typedef {Object} PaginationProps
 * @prop {string} [className]
 * @prop {any[]} [items]
 * @prop {number} [itemsPerPage]
 * @prop {number} [visiblePages]
 * @prop {number} [defaultPage]
 * @prop { import('react').MouseEventHandler<HTMLInputElement> } [onChange]
 */

const Pagination = ({
  className,
  items,
  itemsPerPage,
  visiblePages,
  defaultPage,
  onChange
}) => {
  const [pages, setPages] = useState([])
  const [pageCount, setPageCount] = useState([])
  const [activePage, setActivePage] = useState(defaultPage)
  // const onDropAccepted = useCallback((files) => onChange && onChange(files), [])
  
  useEffect(() => {
    setPageCount(Math.ceil(items.length/parseInt(itemsPerPage)))
    setActivePage(1)
  }, [itemsPerPage])

  useEffect(() => {
    setPages(
      Array.from({length: pageCount}, (_, i) => i + 1)
        .filter(page => page >= activePage - visiblePages && page <= activePage + visiblePages)
    )
    const firstItem = (activePage - 1) * parseInt(itemsPerPage)
    onChange && onChange(items.slice(firstItem, firstItem + parseInt(itemsPerPage)))
  }, [items, itemsPerPage, visiblePages, activePage])

  return (
    <div className={clsx(className, 'Pagination')}>
      <ul className="pageList">
        {activePage > visiblePages + 1
          && <li className="firstPage" onClick={() => setActivePage(1)}>First</li>
        }
        {activePage > 1
          && <li className="prevPage" onClick={() => setActivePage(activePage - 1)}>Prev</li>
        }
        {activePage > visiblePages + 1
          && <li className="prevEllipses">...</li>
        }
        {pages && pages.map((page, i) => (
          <li
            key={`page-${i}`}
            className={clsx('page', {current: activePage === page })}
            onClick={() => setActivePage(page)}
          >
            {page}
          </li>
        ))}
        {activePage < pageCount - visiblePages
          && <li className="nextEllipses">...</li>
        }
        {activePage < pageCount
          && <li className="nextPage" onClick={() => setActivePage(activePage + 1)}>Next</li>
        }
        {activePage < pageCount - visiblePages
          && <li className="lastPage" onClick={() => setActivePage(pageCount)}>Last</li>
        }
      </ul>
    </div>
  )
}

Pagination.defaultProps = {
  items: [],
  currentPage: 1
}

export default Pagination
