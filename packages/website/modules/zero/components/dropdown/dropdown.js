import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

/**
 * @typedef {Object} DropdownOptionProp
 * @prop {string} [label]
 * @prop {string} [value]
 *
 * @typedef {Object} DropdownProps
 * @prop {string} [className]
 * @prop {DropdownOption[]} [options]
 * @prop { import('react').MouseEventHandler<HTMLSelectElement> } [onChange]
 */

const Dropdown = ({
  className,
  options,
  value,
  onChange
}) => {
  const selectElRef = useRef(null)

  const handleSelectChange = useCallback((selectedIndex) => {
    const selectEl = selectElRef.current
    if(selectedIndex) {
      const option = options[selectedIndex]
      selectEl.value = option.value
    }
    onChange && onChange(selectEl.value)
  }, [])

  useEffect(handleSelectChange, [])

  return (
    <div className={clsx(className, 'Dropdown')}>
      <div className="dropdownList">
        <button type="button">
          {selectElRef && selectElRef.current && selectElRef.current.value}
        </button>
        {options.map((option, i) => (
          <div className="dropdownItem" onClick={() => handleSelectChange(i)}>
            {option.label}
          </div>
        ))}
      </div>
      <select ref={selectElRef} defaultValue={value} onChange={() => handleSelectChange(null)}>
        {options.map((option, i) => (
          <option key={`option-${i}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

Dropdown.defaultProps = {
  options: []
}

export default Dropdown
