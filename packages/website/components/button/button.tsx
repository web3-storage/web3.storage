import clsx from 'clsx';
import { useCallback } from 'react';

import ZeroButton from 'ZeroComponents/button/button';
import { trackEvent, events } from 'lib/countly';

export enum ButtonVariant {
  NONE = 'none',
  DARK = 'dark',
  LIGHT = 'light',
  PURPLE = 'purple',
  PINK_BLUE = 'pink-blue',
  TEXT = 'text',
  OUTLINE_DARK = 'outline-dark',
  OUTLINE_LIGHT = 'outline-light',
}

type TrackingProps = {
  /** UI section id. One of countly.ui. */
  ui?: string;
  /** Action id. used to uniquely identify an action within a ui section. */
  action?: string;
  /** Custom event name to be used instead of the default CTA_LINK_CLICK. */
  event?: string;
  /** The data attached to this tracking event */
  data?: Record<string, any>;
};

type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  href?: string;
  tracking?: TrackingProps;
  variant?: ButtonVariant;
  children?: React.ReactNode;
  disabled?: boolean;
};

const Button = ({
  className,
  onClick,
  href,
  tracking,
  variant = ButtonVariant.DARK,
  children,
  ...props
}: ButtonProps & Partial<Omit<HTMLButtonElement, 'children'>>) => {
  const onClickHandler = useCallback(
    event => {
      tracking &&
        trackEvent(tracking.event || events.CTA_LINK_CLICK, {
          ui: tracking.ui,
          action: tracking.action,
          link: href || '',
          ...(tracking.data || {}),
        });
      onClick && onClick(event);
    },
    [href, onClick, tracking]
  );

  return (
    // @ts-ignore Ignoring ZeroButton as it is not properly typed
    <ZeroButton {...props} className={clsx('button', variant, className)} onClick={onClickHandler}>
      {children}
    </ZeroButton>
  );
};

export default Button;
