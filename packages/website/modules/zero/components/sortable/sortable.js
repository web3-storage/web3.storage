import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'

import Dropdown from 'ZeroComponents/dropdown/dropdown'

/**
 * @typedef {Object} SortOptionProp
 * @prop {string} [label]
 * @prop {string} [value]
 *
 * @typedef {Object} SortableProps
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
 *
 * @param {SortableProps} props
 */
const Sortable = ({
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

Sortable.defaultProps = {
  items: [],
  options: [],
  value: null,
  queryParam: null
}

export default Sortable
