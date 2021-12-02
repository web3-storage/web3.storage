import { useCallback } from 'react'
import clsx from 'clsx'
import countly from 'Lib/countly'

import ZeroButton from 'ZeroComponents/button/button'

export const ButtonVariant = {
  DARK: 'dark',
  LIGHT: 'light',
  PURPLE: 'purple'
}

/**
 * @typedef {Object} TrackingProp
 * @prop {string} ui UI section id. One of countly.ui.
 * @prop {string} [action] Action id. used to uniquely identify an action within a ui section.
 * @prop {string} [event] Custom event name to be used instead of the default CTA_LINK_CLICK.
 *
 * @typedef {Object} ButtonProps
 * @prop {string} [className]
 * @prop { import('react').MouseEventHandler<HTMLButtonElement> } [onClick]
 * @prop {string} [href]
 * @prop {TrackingProp} [tracking]
 * @prop {'dark' | 'light' | 'purple' } [variant]
 * @prop {import('react').ReactNode | string} children
 */

const Button = ({
  className,
  onClick,
  href,
  tracking,
  variant = 'dark',
  children,
  ...props
}) => {

  const onClickHandler = useCallback((event) => {
    tracking && countly.trackEvent(tracking.event || countly.events.CTA_LINK_CLICK, {
      ui: tracking.ui,
      action: tracking.action,
      link: href || '',
      ...(tracking.data || {}),
    })
    onClick && onClick(event)
  }, [])

  return (
    <ZeroButton
      {...props}
      className={clsx("button", variant)}
      onClick={onClickHandler}
    >
      {children}
    </ZeroButton>
  )
}

Button.propTypes = {

}

Button.defaultProps = {
  variant: ButtonVariant.DARK,
}

export default Button
