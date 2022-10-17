import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

/**
 * Return whether a url is 'external' relative to another URL.
 * The url is considered external if it has a different hostname.
 * @param {URL} url
 * @param {URL} relativeTo - url to compare for externality
 */
function isExternalLink(url, relativeTo) {
  return url.hostname !== relativeTo.hostname;
}

/**
 * @param {string} href - href attribute of an <a>
 * @returns {boolean} - whether the provided href is known to be external from the current document
 */
function useHrefExternality(href) {
  const [document, setDocument] = React.useState(/** @type {Document|undefined} */ (undefined));
  // useEffect because next ssr wont have a document
  React.useEffect(() => {
    if (typeof globalThis.document !== 'undefined') {
      setDocument(globalThis.document);
    }
  }, []);
  const isExternalHref = React.useMemo(() => {
    if (!document) {
      return false;
    }
    const documentURL = new URL(document.URL);
    const isExternal = isExternalLink(new URL(href, documentURL), documentURL);
    return isExternal;
  }, [document, href]);
  return isExternalHref;
}

/**
 * A generic hyperlink component.
 * * by default, links to external sites will have target=_blank if they are an external link
 * @param {object} props
 * @param {string} props.href - the href attribute for the link
 * @param {number} [props.tabIndex] - the tabIndex attribute for the link
 * @param {string} [props.target] - the target attribute for the link
 * @param {React.ReactNode} [props.children]
 * @param {React.MouseEventHandler<HTMLAnchorElement>} [props.onClick] - the onClick handler for the link
 */
const WrappedLink = ({ tabIndex = 0, href, target, ...otherProps }) => {
  const isExternalHref = useHrefExternality(href);
  const derrivedTarget = isExternalHref ? '_blank' : '_self';
  return (
    <Link href={href} {...otherProps}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <a target={derrivedTarget} {...otherProps} tabIndex={tabIndex} onClick={otherProps.onClick}>
        {otherProps.children}
      </a>
    </Link>
  );
};

WrappedLink.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
  href: PropTypes.string.isRequired,
  target: PropTypes.string,
};

export default WrappedLink;
