import { useCallback, useState, useEffect } from 'react'
import clsx from 'clsx'

/**
 * @typedef {Object} FilterbarProps
 * @prop {string} [className]
 * @prop {ReactComponent} [icon]
 * @prop {string} [value]
 * @prop {string} [placeholder]
 * @prop { import('react').MouseEventHandler<HTMLInputElement> } [onChange]
 */

const FilterBar = ({
  className,
  icon,
  value,
  placeholder,
  onChange
}) => {
  const [focused, setFocused] = useState(false);

  const handleOnChange = useCallback((event) => onChange && onChange(event.target.value), [])
  const focusInput = useCallback(() => setFocused(true), [])
  const unfocusInput = useCallback(() => setFocused(false), [])

  useEffect(() => onChange && onChange(value))
  
  return (
    <div className={clsx(className, 'Filterbar', {focused})}>

      {icon && <div className="filterbar-icon">{icon}</div>}

      <input
        className="filterbar-input"
        defaultValue={value}
        placeholder={placeholder}
        type="text"
        onChange={handleOnChange}
        onFocus={focusInput}
        onBlur={unfocusInput}/>
    </div>
  );
}

FilterBar.defaultProps = {}

export default FilterBar
