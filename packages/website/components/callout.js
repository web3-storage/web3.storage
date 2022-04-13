import React from 'react';

const themes = {
  default:
    'bg-orange-50 border border-orange-100 text-orange-800 dark:text-orange-300 dark:bg-orange-400 dark:border-orange-400 dark:bg-opacity-20 dark:border-opacity-30',
  error:
    'bg-red-100 border border-red-200 text-red-900 dark:text-red-200 dark:bg-red-900 dark:bg-opacity-30 dark:border-opacity-30',
  warning:
    'bg-yellow-50 border border-yellow-100 text-yellow-900 dark:text-yellow-200 dark:bg-yellow-700 dark:bg-opacity-30',
};

const Callout = ({ children, type = 'default' }) => {
  return React.createElement(
    'div',
    { className: `${themes[type]} flex rounded-lg callout mt-6` },
    React.createElement('div', { className: 'pr-4 py-2' }, children)
  );
};

export default Callout;
