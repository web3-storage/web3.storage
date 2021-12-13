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
 * @prop {string} [value]
 * @prop {boolean} [scrollable]
 * @prop { import('react').MouseEventHandler<HTMLSelectElement> } [onChange]
 */

const Dropdown = ({
  className,
  options,
  value,
  scrollable,
  onChange
}) => {
  const selectElRef = useRef(null)
  const dropdownElRef = useRef(null)

  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const getSelectIndex = useCallback((index) => {
    const selectEl = selectElRef.current
    return options.findIndex(option => option.value === selectEl.value)
  }, [])

  const handleSelectChange = useCallback(() => setSelectedIndex(getSelectIndex()), [])

  const handleDropdownItemSelected = useCallback((index) => {
    setSelectedIndex(index)
    setIsOpen(false)
  }, [])

  function setDropdownItem(index) {
    const dropdownEl = dropdownElRef.current
    setSelectedIndex(index)
    dropdownEl.getElementsByClassName('dropdownItem')[index].focus()
  }

  const handleDropdownKeyUp = useCallback((event) => {
    const dropdownEl = dropdownElRef.current
    const currentIndex = getSelectIndex()

    if(event.key === 'Escape') {
      setIsOpen(false)
    }
    if(event.key === 'Enter') {
      if(document.activeElement !== dropdownEl.getElementsByClassName('dropdownItem')[currentIndex])
        setDropdownItem(currentIndex)
    }
    else if(event.key === 'ArrowUp') {
      if(document.activeElement !== dropdownEl.getElementsByClassName('dropdownItem')[currentIndex]) {
        setDropdownItem(currentIndex)
      } else {
        if(currentIndex > 0)
          setDropdownItem(currentIndex - 1)
      }
    }
    else if(event.key === 'ArrowDown') {
      if(document.activeElement !== dropdownEl.getElementsByClassName('dropdownItem')[currentIndex]) {
        setDropdownItem(currentIndex)
      } else {
        if(currentIndex < options.length - 1)
          setDropdownItem(currentIndex + 1)
      }
    }
    else if(event.key === 'ArrowLeft') {
      if(currentIndex > 0)
        setDropdownItem(currentIndex - 1)
    }
    else if(event.key === 'ArrowRight') {
      if(currentIndex < options.length - 1)
        setDropdownItem(currentIndex + 1)
    }
  }, [])

  useEffect(() => {
    if(selectedIndex || selectedIndex === 0) {
      const selectEl = selectElRef.current
      const option = options[selectedIndex]
      if(!option) return
      selectEl.value = option.value
      onChange && onChange(selectEl.value)
    }
  }, [selectedIndex])

  useEffect(handleSelectChange, [])

  return (
    <div
      className={clsx(className, 'Dropdown', { open: isOpen, scrollable })}
      tabIndex="-1"
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
        {options[selectedIndex] && options[selectedIndex].label}
      </button>

      <div className="dropdownContent">
        <div ref={dropdownElRef} className={clsx('dropdownItemList')} role="listbox" tabIndex="-1">
          {options.map((option, i) => (
            <div
              key={`item-${i}`}
              className={clsx('dropdownItem', { current: selectedIndex === i })}
              tabIndex="-1"
              role="option"
              aria-selected={selectedIndex === i ? 'true' : 'false'}
              onClick={() => handleDropdownItemSelected(i)}
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
          defaultValue={value}
          onChange={handleSelectChange}
          aria-hidden="true"
        >
          {options.map((option, i) => (
            <option key={`option-${i}`} value={option.value}>
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
  scrollable: false
}

export default Dropdown
