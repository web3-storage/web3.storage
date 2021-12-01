import { useCallback, Fragment, useState, useEffect } from 'react'
import clsx from 'clsx'

/**
 * @typedef {Object} PaginationProps
 * @prop {string} [className]
 * @prop {any[]} [items]
 * @prop {number} [itemsPerPage]
 * @prop {number} [visiblePages]
 * @prop { import('react').MouseEventHandler<HTMLInputElement> } [onChange]
 */

const Pagination = ({
  className,
  items,
  itemsPerPage,
  visiblePages,
  currentPage,
  onChange
}) => {
  const [pages, setPages] = useState([])
  // const onDropAccepted = useCallback((files) => onChange && onChange(files), [])
  
  // const onDropRejected = useCallback((files) => onError && onError(files), [])

  // const {acceptedFiles, fileRejections, getRootProps, getInputProps} = useDropzone({onDropAccepted, onDropRejected, ...props})
  
  useEffect(() => {
    const pageCount = Math.ceil(items.length/itemsPerPage)
    // console.log('changed', [...Array(pageCount).keys()])
    // console.log('changed', )
    setPages(Array.from({length: pageCount}, (_, i) => i + 1))
  }, [items, itemsPerPage])

  return (
    <div className={clsx(className, 'Pagination')}>
      <ul className="pageList">
        {pages && pages.map((page, i) => (
          <li key={`page-${i}`} className={clsx('page', {current: currentPage === i + 1})}>{page}</li>
        ))}
      </ul>
    </div>
  )
}

Pagination.defaultProps = {
  items: [],
  currentPage: 1
}

export default Pagination
