import clsx from 'clsx'
import React from 'react'
import Tick from '../icons/tick'

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {string} [props.label]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.checked]
 * @param {function} [props.onChange]
 * @returns
 */
const Checkbox = ({ className, label, disabled, checked, onChange, ...props }) => {
  /**
   * @param {Object} event
   * @param {HTMLInputElement} event.target
   */
  const change = (event) => onChange && onChange(event?.target?.checked)

  return <label className={clsx('block', className)} {...props }>
        <input className='absolute top-0 left-0 pointer opacity-0' type='checkbox' checked={checked} disabled={disabled} onChange={change} />
        <div className={ clsx('relative w-4 h-4 border border-w3storage-red',
          disabled ? 'bg-gray-400' : 'bg-w3storage-red-background cursor-pointer')
        }>
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
