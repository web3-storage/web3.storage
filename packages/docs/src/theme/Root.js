import React from 'react'
import Navbar from '@site/src/components/Navbar'

function Root ({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default Root
