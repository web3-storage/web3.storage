import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'

import Dropdown from 'ZeroComponents/dropdown/dropdown'

/**
 * @typedef {Object} SortOptionProp
 * @prop {string} [label]
 * @prop {string} [value]
 * @prop {string} [key]
 * @prop {string} [direction]
 * @prop {function} [compareFn]
 *
 * @typedef {Object} SortableProps
 * @prop {string} [className]
 * @prop {any[]} [items]
 * @prop {SortOptionProp[]} [options]
 * @prop {string} [value]
 * @prop {string} [queryParam]
 * @prop {number} [defaultIndex]
 * @prop {function} [onChange]
 */

export const SortDirection = { ASC: 'ASC', DESC: 'DESC' }

export const SortType = {
  ALPHANUMERIC: (items, direction, key) => {
    if(key) {
      if(direction === SortDirection.ASC) {
        return items.sort((a, b) => a[key] && b[key] ? a[key].localeCompare(b[key]) : console.warn(`Missing key ${key}`))
      } else if(direction === SortDirection.DESC) {
        return items.sort((a, b) => a[key] && b[key] ? b[key].localeCompare(a[key]) : console.warn(`Missing key ${key}`))
      }
    }
    else if(direction === SortDirection.ASC) {
      return items.sort((a, b) => typeof a !== 'object' && typeof b !== 'object' ? a.localeCompare(b) : console.warn(`Missing key definition`))
    } else if(direction === SortDirection.DESC) {
      return items.sort((a, b) => typeof a !== 'object' && typeof b !== 'object' ? b.localeCompare(a) : console.warn(`Missing key definition`))
    }
    return items
  }
}

/**
 * 
 * @param {SortableProps} props
 */
const Sortable = ({
  className,
  items,
  options,
  value,
  queryParam,
  onChange
}) => {
  const [currentOption, setCurrentOption] = useState(/** @type {any} */(null))

  const handleDropdownChange = useCallback((newValue) => {
    const option = options?.find(option => option.value === newValue)
    if(!option) return
    setCurrentOption(option)
  }, [items, options, currentOption, setCurrentOption])

  useEffect(() => {
    if(!currentOption) return
    const compareFn = currentOption.compareFn || SortType.ALPHANUMERIC
    const direction = currentOption.direction || SortDirection.ASC
    const key = currentOption.key || null
    const sortedItems = compareFn(items?.slice(0), direction, key)

    onChange && onChange(sortedItems)
  }, [items, currentOption, onChange])

  return (
    <div className={clsx(className, 'Sortable')}>
      <Dropdown
        value={value}
        options={options?.map((option) => (
          { label: option.label, value: `${option.value}` }
        ))}
        queryParam={queryParam}
        onChange={handleDropdownChange}
      />
    </div>
  )
}

Sortable.defaultProps = {
  items: [],
  options: [],
  value: null,
  queryParam: null
}

export default Sortable
