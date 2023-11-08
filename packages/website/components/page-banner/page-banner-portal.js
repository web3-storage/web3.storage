/**
 * @fileoverview component that contains a 'page banner', i.e. a banner across the whole
 * web page that shows a prominent message to the end-user.
 */

import clsx from 'clsx';

export const defaultPortalElementId = 'page-banner-portal';
export const defaultContentsClassName = 'contents';

/**
 * wrap children in stiles like a .message-banner (see ../messagebanner/messagebanner.scss)
 */
function MessageBannerStyled({ children }) {
  return (
    <>
      <div className={clsx('message-banner-wrapper')}>
        <div className="grid-noGutter">
          <div className="col">
            <div className="message-banner-container">
              <div className={clsx('message-banner-content', 'mb-reduced-fontsize')}>{children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * component for an element across the top of page that can host banner messages on a per-page basis.
 * Other components will use React.createPortal() to render into this even though it isn't a child of
 * that component (since it needs to be atop the page).
 */
export const PageBannerPortal = ({ id, contentsClassName = defaultContentsClassName }) => {
  return (
    <div id={id}>
      <MessageBannerStyled>
        <span className={contentsClassName}></span>
      </MessageBannerStyled>
    </div>
  );
};
