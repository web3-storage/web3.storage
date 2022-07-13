import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

const WrappedLink = ({ tabIndex = 0, href, ...otherProps }) => (
  <Link href={href} {...otherProps}>
    <a href="replace" {...otherProps} tabIndex={tabIndex} onClick={otherProps.onClick}>
      {otherProps.children}
    </a>
  </Link>
);

WrappedLink.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
  href: PropTypes.string.isRequired,
};

export default WrappedLink;
