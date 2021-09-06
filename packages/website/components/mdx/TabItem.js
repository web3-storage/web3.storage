import React from 'react'

/**
 * @typedef {object} TabItemProps
 * @property {React.ReactChildren} children
 * @property {string} value
 * @property {string} [label]
 * @property {boolean} [hidden]
 * @property {string} [className] 
 * 
 * @param {TabItemProps} props
 * @returns {React.ReactElement}
 */
export default function TabItem({ children, hidden, className }) {
  return (
    <div role="tabpanel" {...{ hidden, className }}>
      {children}
    </div>
  )
}
