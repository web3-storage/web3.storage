import React from 'react'

export default function TabItem({ children, hidden, className }) {
  return (
    <div role="tabpanel" {...{ hidden, className }}>
      {children}
    </div>
  )
}
