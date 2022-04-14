import React from 'react';

const Callout = ({ children, type = 'default' }) => {
  return <div className={`callout ${type}`}>{children}</div>;
};

export default Callout;
