import { useCallback } from 'react'
import Link from 'next/link'
import clsx from 'clsx'

import countly from '../lib/countly'

/**
 * @typedef {Object} TrackingProp
 * @prop {string} ui UI section id. One of countly.ui.
 * @prop {string} [action] Action id. used to uniquely identify an action within a ui section.
 * @prop {string} [event] Custom event name to be used instead of the default CTA_LINK_CLICK.
 * @prop {Object} [data] Extra data to send to countly.
 *
 * @typedef {Object} ButtonProps
 * @prop {string} [wrapperClassName]
 * @prop {string} [className]
 * @prop { import('react').MouseEventHandler<HTMLButtonElement> } [onClick]
 * @prop {string} [href]
 * @prop {import('react').ButtonHTMLAttributes<HTMLButtonElement>["type"]} [type]
 * @prop {import('react').ReactNode | string} children
 * @prop {boolean} [disabled]
 * @prop {string} [id]
 * @prop {'dark' | 'light' | 'outlined' } [variant]
 * @prop {boolean} [small] If the button should have min-width & height or not
 * @prop {import('react').FunctionComponent} [Icon] Icon component to prefix
 * @prop {TrackingProp} [tracking] Tracking data to send to countly on button click
 */

/**
 *
 * @param {ButtonProps} param0
 * @returns
 */
export default function Button({
  id,
  wrapperClassName,
  className,
  onClick,
  href,
  type = 'button',
  children,
  disabled = false,
  variant = 'dark',
  small,
  Icon,
  tracking,
  ...props
}) {
  const onClickHandler = useCallback((event) => {
    tracking && countly.trackEvent(tracking.event || countly.events.CTA_LINK_CLICK, {
      ui: tracking.ui,
      action: tracking.action,
      link: href,
      ...(tracking.data || {}),
    })
    onClick && onClick(event)
  }, [tracking, onClick, href])

  const buttonStyle = small ? {} : { minWidth: '6rem', minHeight: '3.25rem' }
  let variantClasses = ''

  switch(variant) {
    case 'dark':
      variantClasses = 'bg-w3storage-purple text-white border border-transparent'
      break

    case 'light':
      variantClasses = 'bg-white text-w3storage-purple border border-transparent'
      break

    case 'outlined':
      variantClasses = 'bg-transparent border-2 border-w3storage-purple text-w3storage-purple'
      break
  }

  const btn = (
    <button
      type={type}
      className={clsx(
        variantClasses,
        'flex',
        'items-center',
        'justify-center',
        'hover:opacity-90',
        'focus:opacity-90',
        'focus:border-white',
        'px-4',
        disabled ?
          'cursor-auto opacity-50' :
          'hover:opacity-90 focus:opacity-90 focus:border-white',
        'typography-cta',
        !small && 'w-full',
        className
      )}
      style={buttonStyle}
      onClick={onClickHandler}
      disabled={disabled}
      id={id}
      {...props}
    >
      { Icon && <Icon className="w-7 mr-2 fill-current"/> }
      {children}
    </button>
  )
  return href ? (
    <Link href={href}>
      <div className={wrapperClassName}>
        {btn}
      </div>
    </Link>
  ) : (
    <div className={wrapperClassName}>
      {btn}
    </div>
  )
}
