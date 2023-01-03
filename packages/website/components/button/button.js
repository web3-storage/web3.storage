import clsx from 'clsx';
import React, { useCallback } from 'react';

import ZeroButton from 'ZeroComponents/button/button';
import { events, saEvent } from 'lib/analytics';
import Tooltip from 'ZeroComponents/tooltip/tooltip';

export const ButtonVariant = {
  GRAY: 'gray',
  DARK: 'dark',
  LIGHT: 'light',
  PURPLE: 'purple',
  PINK_BLUE: 'pink-blue',
  TEXT: 'text',
  OUTLINE_DARK: 'outline-dark',
  OUTLINE_LIGHT: 'outline-light',
};
/**
 * @typedef {Object} TrackingProps
 * @prop {string} [ui] UI section id. One of analytics.ui.
 * @prop {string} [action] Action id. used to uniquely identify an action within a ui section.
 * @prop {string} [event] Custom event name to be used instead of the default CTA_LINK_CLICK.
 * @prop {Record<string, any>} [data] The data attached to this tracking event
 */

/**
 * @typedef {Object} ButtonProps
 * @prop {React.MouseEventHandler<HTMLButtonElement>} [onClick]
 * @prop {string} [className]
 * @prop {string} [href]
 * @prop {string} [tooltip]
 * @prop {string} [tooltipPos]
 * @prop {TrackingProps} [tracking]
 * @prop {string} [variant]
 * @prop {React.ReactNode} [children]
 * @prop {boolean} [disabled]
 */

/**
 *
 * @param {ButtonProps & Partial<Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>>} props
 * @returns
 */
const Button = ({
  className,
  tooltip,
  tooltipPos,
  onClick,
  tracking,
  variant = ButtonVariant.DARK,
  children,
  ...props
}) => {
  const onClickHandler = useCallback(
    event => {
      tracking &&
        saEvent(tracking.event || events.CTA_LINK_CLICK, {
          ui: tracking.ui,
          action: tracking.action,
          link: props.href || '',
          ...(tracking.data || {}),
        });
      onClick && onClick(event);
    },
    [props.href, onClick, tracking]
  );

  const btn = (
    // @ts-ignore Ignoring ZeroButton as it is not properly typed
    <ZeroButton {...props} className={clsx('button', variant, className)} onClick={onClickHandler}>
      {children}
    </ZeroButton>
  );

  return tooltip ? (
    <Tooltip content={tooltip} position={tooltipPos}>
      {btn}
    </Tooltip>
  ) : (
    btn
  );
};

export default Button;
