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
 * @prop {string} [staticLabel]
 * @prop {number} [defaultIndex]
 * @prop {function} [onChange]
 * @prop {import('react').ChangeEventHandler<HTMLSelectElement>} [onSelectChange]
 */

export const SortDirection = {
  ASC: 'ASC',
  DESC: 'DESC',
  NEWEST: 'NEWEST',
  OLDEST: 'OLDEST',
  LARGEST: 'LARGEST',
  SMALLEST: 'SMALLEST'
}

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
  },
  TIMEBASED: (items, direction) => {
    if (direction === SortDirection.NEWEST) {
      return items.sort((a, b) => b['created'].localeCompare(a['created']))
    } else if (direction === SortDirection.OLDEST) {
      return items.sort((a, b) => a['created'].localeCompare(b['created']))
    }
    return items
  },
  SIZEBASED: (items, direction) => {
    if (direction === SortDirection.LARGEST) {
      return items.sort((a, b) => b.dagSize - a.dagSize)
    } else if (direction === SortDirection.SMALLEST) {
      return items.sort((a, b) => a.dagSize - b.dagSize)
    }
    return items
  }
  /** TODO: Add file type sorting if available
   * {
   * label: 'File type',
   * value: 'fileType',
   * compareFn: items => items.sort((a, b) => b.dagSize < a.dagSize),
   * },
   */
  /** TODO: Confirm what miner sorting is
   * {
   * label: 'Miner',
   * value: 'miner',
   * compareFn: items => items.sort((a, b) => b.dagSize < a.dagSize),
   * },
   */
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
  onChange,
  staticLabel,
  onSelectChange
}) => {
  const [currentOption, setCurrentOption] = useState(/** @type {any} */(null))

  const handleDropdownChange = useCallback((newValue) => {
    const option = options?.find(option => option.value === newValue)
    if(!option) return
    setCurrentOption(option)
  }, [items, options, currentOption, setCurrentOption])

  useEffect(() => {
    if(!currentOption) return
    const compareFn = SortType[currentOption.compareFn] || SortType.ALPHANUMERIC
    const direction = SortDirection[currentOption.direction] || SortDirection.ASC
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
        staticLabel={staticLabel}
        onSelectChange={onSelectChange}
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

/**
 * @typedef {Object} ServerSortOptionProp
 * @prop {string} [label]
 * @prop {string} [value]
 *
 * @typedef {Object} ServerSortableProps
 * @prop {string} [className]
 * @prop {SortOptionProp[]} [options]
 * @prop {string} [value]
 * @prop {string} [queryParam]
 * @prop {string} [staticLabel]
 * @prop {number} [defaultIndex]
 * @prop {function} [onChange]
 * @prop {import('react').ChangeEventHandler<HTMLSelectElement>} [onSelectChange]
 */

/**
 * @param {ServerSortableProps} props
 */
export const ServerSortable = ({
  className,
  options,
  value,
  queryParam,
  onChange,
  staticLabel
}) => {
  const [currentOption, setCurrentOption] = useState(/** @type {any} */(null))

  const handleDropdownChange = useCallback((newValue) => {
    const option = options?.find(option => option.value === newValue)
    if(!option) return
    setCurrentOption(option)
  }, [options, currentOption, setCurrentOption])

  useEffect(() => {
    if(!currentOption) return
    const [sortBy, sortOrder] = currentOption.value.split(',')
    onChange && onChange({ sortBy, sortOrder })
  }, [currentOption, onChange])

  return (
    <div className={clsx(className, 'Sortable')}>
      <Dropdown
        value={value}
        options={options}
        queryParam={queryParam}
        onChange={handleDropdownChange}
        staticLabel={staticLabel}
      />
    </div>
  )
}

ServerSortable.defaultProps = {
  items: [],
  options: [],
  value: null,
  queryParam: null
}
