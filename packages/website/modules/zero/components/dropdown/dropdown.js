import clsx from 'clsx'
import { useMemo, useCallback, useEffect, useRef, useState } from 'react'

import useQueryParams from 'ZeroHooks/useQueryParams'

/**
 * @typedef {Object} DropdownOptionProp
 * @prop {string} [label]
 * @prop {string} [value]
 *
 * @typedef {Object} DropdownProps
 * @prop {string} [className]
 * @prop {DropdownOptionProp[]} options
 * @prop {string|number} [value]
 * @prop {boolean} [scrollable]
 * @prop {string} [queryParam]
 * @prop {string} [staticLabel]
 * @prop {function} [onChange]
 * @prop { import('react').ChangeEventHandler<HTMLSelectElement> } [onSelectChange]
 */

/**
 * 
 * @param {DropdownProps} props
 * @returns 
 */
const Dropdown = ({
  className,
  options,
  value,
  scrollable,
  queryParam,
  onChange,
  staticLabel,
  onSelectChange
}) => {
  const selectElRef = useRef(/** @type {any} */(null))

  const [isOpen, setIsOpen] = useState(false)
  const [dropdownValue, setDropdownValue] = useState(null)

  const [queryValue, setQueryValue] = useQueryParams(queryParam, value)

  const currentItem = useMemo(() => options.find(option => String(option.value) === String(queryParam ? queryValue : dropdownValue)) || options[0], [options, queryParam, queryValue, dropdownValue])

  const setCurrentItem = useCallback((newValue, close = true) => {
    queryParam ? setQueryValue(newValue) : setDropdownValue(newValue)
    close && setIsOpen(false)
  }, [queryParam, setQueryValue, setDropdownValue, isOpen, setIsOpen])

  useEffect(() => {
    if (!currentItem || !currentItem.value) return
    const selectEl = selectElRef.current
    selectEl.value = currentItem.value
    onChange && onChange(currentItem.value)
  }, [queryValue, dropdownValue])

  const handleDropdownKeyUp = useCallback((event) => {
    const selectEl = selectElRef.current
    const currentIndex = options.findIndex(option => option.value === selectEl.value)

    if (event.key === 'Escape') {
      setIsOpen(false)
    }
    if (event.key === 'Enter') {
      setCurrentItem(options[currentIndex].value)
    }
    else if (event.key === 'ArrowUp') {
      if (!isOpen)
        setIsOpen(true)
      else if (currentIndex > 0)
        setCurrentItem(options[currentIndex - 1].value, false)
    }
    else if (event.key === 'ArrowDown') {
      if (!isOpen)
        setIsOpen(true)
      else if (currentIndex < options.length - 1)
        setCurrentItem(options[currentIndex + 1].value, false)
    }
    else if (event.key === 'ArrowLeft') {
      if (currentIndex > 0)
        setCurrentItem(options[currentIndex - 1].value)
    }
    else if (event.key === 'ArrowRight') {
      if (currentIndex < options.length - 1)
        setCurrentItem(options[currentIndex + 1].value)
    }
  }, [options, setIsOpen, setCurrentItem])

  return (
    <div
      role="button"
      className={clsx(className, 'Dropdown', { open: isOpen, scrollable })}
      tabIndex={-1}
      onBlur={(event) => !event.relatedTarget && setIsOpen(false)}
      onKeyUp={handleDropdownKeyUp}
    >
      <button
        className="dropdownButton"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        <span>{staticLabel || (currentItem && currentItem.label)}</span>
      </button>

      <div className="dropdownContent">
        <div className={clsx('dropdownItemList')} role="listbox" aria-label='dropdown' tabIndex={-1}>
          {options.map((option) => (
            <div
              key={`item-${option.value}`}
              className={clsx('dropdownItem', { current: currentItem.value === option.value })}
              tabIndex={-1}
              role="option"
              aria-selected={currentItem.value === option.value ? 'true' : 'false'}
              onClick={() => {
                setCurrentItem(option.value);
                selectElRef.current.value = option.value;
                selectElRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setIsOpen(false)}
              onKeyUp={(event) => (event.key === 'Enter' && isOpen) && setIsOpen(false)}
            >
              {option.label}
            </div>
          ))}
        </div>

        <select
          ref={selectElRef}
          className="dropdownSelect"
          aria-hidden="true"
          onChange={onSelectChange}
        >
          {options.map((option) => (
            <option key={`option-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

Dropdown.defaultProps = {
  options: [],
  scrollable: false,
  value: null
}

export default Dropdown
