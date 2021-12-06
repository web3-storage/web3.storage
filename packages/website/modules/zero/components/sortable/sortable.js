import { useCallback, useEffect } from 'react'
import clsx from 'clsx'

import Dropdown from 'ZeroComponents/dropdown/dropdown'

/**
 * @typedef {Object} SortOptionProp
 * @prop {string} [label]
 * @prop {string} [key]
 * @prop {string} [direction] 
 * @prop {function} [compareFn]
 *
 * @typedef {Object} SortableProps
 * @prop {string} [className]
 * @prop {any[]} [items]
 * @prop {SortOption[]} [options]
 * @prop {number} [defaultIndex]
 * @prop { import('react').MouseEventHandler<HTMLSelectElement> } [onChange]
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

const Sortable = ({
  className,
  items,
  options,
  defaultIndex,
  onChange
}) => {
  const handleSort = useCallback((sortIndex) => {
    sortIndex = parseInt(sortIndex)
    const option = options[sortIndex]
    if(!option || !onChange) return

    const compareFn = option.compareFn || SortType.ALPHANUMERIC
    const direction = option.direction || SortDirection.ASC
    const key = option.key || null
    const sortedItems = compareFn(items.slice(0), direction, key)
    onChange(sortedItems)
  }, [])

  useEffect(() => handleSort(defaultIndex), [])

  return (
    <div className={clsx(className, 'Sortable')}>
      <Dropdown
        value={`${defaultIndex}`}
        options={options.map((option, i) => (
          { label: option.label, value: `${i}` }
        ))}
        onChange={optionIndex => handleSort(optionIndex)}
      />
    </div>
  )
}

Sortable.defaultProps = {
  defaultIndex: 0,
  items: [],
  options: []
}

export default Sortable
