import clsx from 'clsx'
import { useMemo, useCallback, useEffect, useState } from 'react'

import useQueryParams from 'ZeroHooks/useQueryParams'
import SearchBar from 'ZeroComponents/searchbar/searchbar'

/**
 * @typedef {Object} FilterableProps
 * @prop {string} [className]
 * @prop {any[]} [items]
 * @prop {string[]} [filterKeys]
 * @prop {string} [value]
 * @prop {string} [queryParam]
 * @prop {string} [placeholder]
 * @prop {React.ReactNode} [icon]
 * @prop {function} [onChange]
 */

/**
 * 
 * @param {FilterableProps} props
 */
const Filterable = ({
  className,
  items,
  filterKeys = [],
  value,
  queryParam,
  onChange,
  onValueChange,
  ...props
}) => {
  const [queryValue, setQueryValue] = useQueryParams(queryParam, value)

  const [filterValue, setFilterValue] = useState('')

  const currentValue = useMemo(() => queryValue || filterValue, [queryValue, filterValue])

  const setCurrentValue = useCallback((newValue) => onValueChange?.(newValue) ?? (queryParam ? setQueryValue(newValue) : setFilterValue(newValue)), [queryParam, setQueryValue, setFilterValue])

  useEffect(() => {
    if(!currentValue) return onChange && onChange(items?.slice(0))
    const filteredItems = items.slice(0).filter(item => filterKeys.filter(filterKey => String(item[filterKey] || item).toLowerCase().includes(currentValue.toLowerCase())).length > 0)
    onChange && onChange(filteredItems)
  }, [items, currentValue, onChange])

  return (
    <div className={clsx(className, 'Filterable')}>
      <SearchBar
        {...props}
        value={currentValue}
        onChange={setCurrentValue}
      />
    </div>
  )
}

Filterable.defaultProps = {
  items: [],
  value: '',
  queryParam: null
}

export default Filterable
