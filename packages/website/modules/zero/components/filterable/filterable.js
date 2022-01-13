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
  ...props
}) => {
  const [queryValue, setQueryValue] = useQueryParams(queryParam, value)

  const [filterValue, setFilterValue] = useState(null)

  const currentValue = useMemo(() => queryParam ? queryValue : filterValue, [queryParam, queryValue, filterValue])

  const setCurrentValue = useCallback((newValue) => queryParam ? setQueryValue(newValue) : setFilterValue(newValue), [queryParam, setQueryValue, setFilterValue])

  useEffect(() => {
    if(!currentValue) return onChange && onChange(items?.slice(0))

    const filteredItems = items?.slice(0).filter(item => filterKeys.filter(filterKey => String(item[filterKey] ? item[filterKey] : item).toLowerCase().includes(currentValue.toLowerCase())).length > 0)

    onChange && onChange(filteredItems)
  }, [currentValue, onChange])

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
