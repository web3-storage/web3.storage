import { useCallback } from 'react'

import ZeroButton from 'ZeroComponents/button/button'
import countly from '../lib/countly'

import styles from './button.module.css';

export const ButtonVariant = {
  DARK: 'dark',
  LIGHT: 'light',
  OUTLINED: 'outlined'
}

/**
 * @typedef {Object} TrackingProp
 * @prop {string} ui UI section id. One of countly.ui.
 * @prop {string} [action] Action id. used to uniquely identify an action within a ui section.
 * @prop {string} [event] Custom event name to be used instead of the default CTA_LINK_CLICK.
 * @prop {Object} [data] Extra data to send to countly.
 *
 * @prop { import('react').MouseEventHandler<HTMLButtonElement> } [onClick]
 */
const Button = ({ tracking, onClick, href, ...props }) => {

  const onClickHandler = useCallback((event) => {
    tracking && countly.trackEvent(tracking.event || countly.events.CTA_LINK_CLICK, {
      ui: tracking.ui,
      action: tracking.action,
      link: href || '',
      ...(tracking.data || {}),
    })
    onClick && onClick(event)
  }, [])

  return <ZeroButton {...props} onClick={onClickHandler} />
}

Button.defaultProps = {
  variant: ButtonVariant.DARK,
}

export default Button
