import clsx from 'clsx'
import React, { useRef } from 'react'
import Tick from '../icons/tick'

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {boolean} [props.disabled]
 * @param {string} [props.disabledText]
 * @param {boolean} [props.checked]
 * @param {function} [props.onChange]
 * @returns
 */
const Checkbox = ({ className, disabled, disabledText, checked, onChange, ...props }) => {
  const /** @type {React.MutableRefObject<HTMLInputElement|null>} */ inputRef = useRef(null);
  /**
   * @param {Object} event
   * @param {HTMLInputElement} event.target
   */
  const change = (event) => onChange && onChange(event?.target?.checked)
  
  /** @type {React.KeyboardEventHandler} */
  const handleCheckboxClick = (event) => {
    if(event.key === 'Enter' || event.key === ' ') {
      const checkBox = inputRef?.current;
      checkBox && checkBox.click()
    }
  }

  return <label className={clsx('block relative', className)} {...props }>
        <input className='absolute top-0 left-0 hidden' type='checkbox' checked={checked} disabled={disabled} onChange={change} ref={inputRef} />
        <div className={ clsx('relative w-4 h-4 border border-w3storage-red',
          disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-w3storage-red-background cursor-pointer')
        } tabIndex={0} onKeyDown={handleCheckboxClick} title={disabledText && disabled ? disabledText : ''}>
          <Tick className={clsx('absolute top-0 left-0 w-full h-full pointer-events-none text-w3storage-red fill-current', checked ? 'opacity-100' : 'opacity-0') }/>
        </div>
    </label>
}

Checkbox.defaultProps = {
  className: '',
  label: '',
  disabled: false,
  checked: null,
  onChange: () => {}
}

export default Checkbox
