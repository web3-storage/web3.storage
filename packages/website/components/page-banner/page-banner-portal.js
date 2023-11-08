/**
 * @fileoverview component that contains a 'page banner', i.e. a banner across the whole
 * web page that shows a prominent message to the end-user.
 */

import clsx from 'clsx';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export const defaultPortalElementId = 'page-banner-portal';
export const defaultContentsClassName = 'page-banner-contents';
export const defaultPortalQuerySelector = `#${defaultPortalElementId} .${defaultContentsClassName}`;

/**
 * wrap children in stiles like a .message-banner (see ../messagebanner/messagebanner.scss)
 */
export function MessageBannerStyled({ children }) {
  return (
    <div className={clsx('message-banner-wrapper')}>
      <div className="message-banner-container" style={{ padding: '0.5em' }}>
        <div className={clsx('message-banner-content', 'message-banner-underline-links', 'mb-reduced-fontsize')}>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * component for an element across the top of page that can host banner messages on a per-page basis.
 * Other components will use ReactDOM.createPortal() to render into this even though it isn't a child of
 * that component (since it needs to be atop the page).
 */
export const PageBannerPortal = ({ id, contentsClassName = defaultContentsClassName }) => {
  return (
    <div id={id}>
      <div className={contentsClassName}></div>
    </div>
  );
};

/**
 * render children into a PageBannerPortal at the top of the page
 */
export const PageBanner = ({ children }) => {
  const pageBannerPortal = globalThis?.document?.querySelector(defaultPortalQuerySelector);
  const bannerChild = (
    <div style={{ width: '100%' }}>
      <MessageBannerStyled>{children}</MessageBannerStyled>
    </div>
  );
  console.log('PageBanner render', { pageBannerPortal, bannerChild });
  return <>{pageBannerPortal && children && ReactDOM.createPortal(bannerChild, pageBannerPortal)}</>;
};
